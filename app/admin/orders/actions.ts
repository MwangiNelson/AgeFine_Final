"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { canTransitionOrder, type OrderStatus } from "@/lib/admin";

/**
 * Move an order to a new status, but only if the transition is allowed by the
 * state machine in lib/admin.ts. Guards against illegal jumps even if the UI
 * is bypassed.
 */
export async function updateOrderStatus(
  id: string,
  from: OrderStatus,
  to: OrderStatus
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!canTransitionOrder(from, to)) {
    return { ok: false, error: `Cannot move an order from ${from} to ${to}.` };
  }

  const supabase = await createClient();
  // Optimistic-concurrency: only update if the row is still in `from`.
  const { error, data } = await supabase
    .from("orders")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "The order changed since you loaded it. Refresh and try again." };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}
