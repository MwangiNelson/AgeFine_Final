"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/supabase/admin-guard";
import { canTransitionOrder, isSensitiveTransition, type OrderStatus, type PaymentStatus } from "@/lib/admin";
import { createCharge, getChargeByTx, elementConfig } from "@/lib/elementpay";

export interface OrderActionResult {
  ok: boolean;
  error?: string;
}

/** Normalise an ElementPay tx status into one of our payment statuses. */
function toPaymentStatus(elementStatus: string | undefined, hasTx: boolean): PaymentStatus {
  switch (elementStatus) {
    case "settled": return "settled";
    case "failed": return "failed";
    case "refunded": return "refunded";
    case "submitted": return "submitted";
    default: return hasTx ? "submitted" : "pending";
  }
}

/**
 * Move an order to a new status. Forward moves are open to any staff; reverts
 * and refunds are super-admin only and require a note. Every change is recorded
 * in order_status_history. Uses optimistic concurrency on the prior status.
 */
export async function updateOrderStatus(
  id: string,
  from: OrderStatus,
  to: OrderStatus,
  note?: string
): Promise<OrderActionResult> {
  const sensitive = isSensitiveTransition(from, to);
  const user = sensitive ? await requireSuperAdmin() : await requireAdmin();

  if (!canTransitionOrder(from, to)) {
    return { ok: false, error: `Cannot move an order from ${from} to ${to}.` };
  }
  if (sensitive && !note?.trim()) {
    return { ok: false, error: "A note is required when reverting or refunding an order." };
  }

  const supabase = await createClient();
  const patch: { status: OrderStatus; paid_at?: string } = { status: to };
  if (to === "paid") patch.paid_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "The order changed since you loaded it. Refresh and try again." };

  await supabase.from("order_status_history").insert({
    order_id: id,
    from_status: from,
    to_status: to,
    note: note?.trim() || null,
    actor_type: "staff",
    actor_email: user.email ?? null,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Manually confirm a payment (M-Pesa, verified by hand for now). Records a
 * settled payment with the optional M-Pesa code + pasted message, and moves a
 * pending order to paid with an audit-trail entry.
 */
export async function confirmPayment(
  orderId: string,
  input: { mpesaCode?: string; mpesaMessage?: string }
): Promise<OrderActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: order, error: loadErr } = await supabase
    .from("orders")
    .select("id, total_kes, status")
    .eq("id", orderId)
    .maybeSingle();
  if (loadErr || !order) return { ok: false, error: loadErr?.message ?? "Order not found." };

  const code = input.mpesaCode?.trim() || null;
  const message = input.mpesaMessage?.trim() || null;

  const { error: insErr } = await supabase.from("order_payments").insert({
    order_id: order.id,
    provider: "mpesa",
    status: "settled",
    amount_kes: order.total_kes,
    currency: "KES",
    mpesa_code: code,
    mpesa_message: message,
  });
  if (insErr) return { ok: false, error: insErr.message };

  if ((order.status as OrderStatus) === "pending_payment") {
    await supabase
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending_payment");
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: "pending_payment",
      to_status: "paid",
      note: code ? `Payment confirmed manually · M-Pesa ${code}` : "Payment confirmed manually",
      actor_type: "staff",
      actor_email: user.email ?? null,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

/** Create an ElementPay charge for an order and record a payment row. */
export async function initiatePayment(orderId: string): Promise<OrderActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: order, error: loadErr } = await supabase
    .from("orders")
    .select("id, phone, total_kes, customer_name")
    .eq("id", orderId)
    .maybeSingle();
  if (loadErr || !order) return { ok: false, error: loadErr?.message ?? "Order not found." };

  const cfg = elementConfig();
  const result = await createCharge({
    orderId: order.id,
    amountKes: order.total_kes,
    phone: order.phone,
    narrative: `Agefine order #${order.id.slice(0, 8)}`,
  });
  if (!result.ok) return { ok: false, error: result.error };

  const { error: insErr } = await supabase.from("order_payments").insert({
    order_id: order.id,
    provider: "elementpay",
    tx_hash: result.txHash ?? null,
    status: toPaymentStatus(result.status, !!result.txHash),
    amount_kes: order.total_kes,
    token: cfg.token || null,
    currency: cfg.currency,
    wallet_address: cfg.walletAddress || null,
    raw: result.raw as never,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/admin/orders");
  return { ok: true };
}

/**
 * Reconcile a payment against ElementPay (the source of truth) and sync the
 * order if it has newly settled/refunded. Records a 'system' history entry.
 */
export async function recheckPayment(paymentId: string): Promise<OrderActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: payment, error: loadErr } = await supabase
    .from("order_payments")
    .select("id, order_id, tx_hash, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (loadErr || !payment) return { ok: false, error: loadErr?.message ?? "Payment not found." };
  if (!payment.tx_hash) return { ok: false, error: "This payment has no transaction to check yet." };

  const result = await getChargeByTx(payment.tx_hash);
  if (!result.ok) return { ok: false, error: result.error };

  const newStatus = toPaymentStatus(result.status, true);
  await supabase
    .from("order_payments")
    .update({ status: newStatus, raw: result.raw as never, updated_at: new Date().toISOString() })
    .eq("id", payment.id);

  // Reflect a newly-settled payment on the order (forward, provider-driven truth).
  if (newStatus === "settled") {
    const { data: order } = await supabase.from("orders").select("status").eq("id", payment.order_id).maybeSingle();
    if (order && (order.status as OrderStatus) === "pending_payment") {
      await supabase
        .from("orders")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payment.order_id)
        .eq("status", "pending_payment");
      await supabase.from("order_status_history").insert({
        order_id: payment.order_id,
        from_status: "pending_payment",
        to_status: "paid",
        note: `Reconciled with ElementPay (${payment.tx_hash}).`,
        actor_type: "system",
        actor_email: "reconcile",
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<void> {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
