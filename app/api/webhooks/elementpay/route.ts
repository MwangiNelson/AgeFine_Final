import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminApiClient } from "@/lib/supabase/admin-api";
import { verifyWebhookSignature, mapElementStatusToOrder, elementConfig } from "@/lib/elementpay";
import type { PaymentStatus } from "@/lib/admin";

export const dynamic = "force-dynamic";

function toPaymentStatus(s: string | undefined): PaymentStatus {
  switch (s) {
    case "settled": return "settled";
    case "failed": return "failed";
    case "refunded": return "refunded";
    case "submitted": return "submitted";
    default: return "pending";
  }
}

/**
 * ElementPay webhook. Verifies the HMAC signature against the raw body, then
 * syncs the matching payment row and (on settle/refund) the order — using the
 * service-role client so it works without a logged-in session.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = elementConfig().webhookSecret;

  if (!verifyWebhookSignature(raw, req.headers.get("x-webhook-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = (body.data as Record<string, unknown> | undefined) ?? body;
  const eventStatus = String(req.headers.get("x-webhook-event") ?? "").replace(/^order\./, "");
  const elementStatus = String((data.status as string) || eventStatus || "");
  const txHash = (data.tx_hash as string) || undefined;
  const clientRef = (data.client_ref as string) || undefined; // our order id
  const providerRef = (data.order_id as string) || undefined;

  const api = createAdminApiClient();

  // Locate the payment row: by tx hash, then provider ref, then latest for the order.
  let payment: { id: string; order_id: string; status: string } | null = null;
  for (const q of [
    txHash ? api.from("order_payments").select("id, order_id, status").eq("tx_hash", txHash).maybeSingle() : null,
    providerRef ? api.from("order_payments").select("id, order_id, status").eq("provider_ref", providerRef).maybeSingle() : null,
    clientRef ? api.from("order_payments").select("id, order_id, status").eq("order_id", clientRef).order("created_at", { ascending: false }).limit(1).maybeSingle() : null,
  ]) {
    if (!q) continue;
    const { data: row } = await q;
    if (row) { payment = row; break; }
  }

  if (!payment) {
    // Nothing to attach to (e.g. charge created out-of-band). Acknowledge so
    // ElementPay doesn't retry indefinitely.
    return NextResponse.json({ ok: true, matched: false });
  }

  const paymentStatus = toPaymentStatus(elementStatus);
  // Idempotent: skip if already in this state.
  if (payment.status === paymentStatus) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await api
    .from("order_payments")
    .update({ status: paymentStatus, tx_hash: txHash ?? undefined, provider_ref: providerRef ?? undefined, raw: body as never, updated_at: new Date().toISOString() })
    .eq("id", payment.id);

  // Sync the order on settle / refund.
  const orderTo = mapElementStatusToOrder(elementStatus);
  if (orderTo) {
    const { data: order } = await api.from("orders").select("status").eq("id", payment.order_id).maybeSingle();
    const from = order?.status as string | undefined;
    if (from && from !== orderTo) {
      const patch: { status: string; paid_at?: string } = { status: orderTo };
      if (orderTo === "paid") patch.paid_at = new Date().toISOString();
      await api.from("orders").update(patch).eq("id", payment.order_id);
      await api.from("order_status_history").insert({
        order_id: payment.order_id,
        from_status: from,
        to_status: orderTo,
        note: `ElementPay webhook: ${eventStatus || elementStatus}${txHash ? ` (${txHash})` : ""}.`,
        actor_type: "system",
        actor_email: "elementpay",
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
