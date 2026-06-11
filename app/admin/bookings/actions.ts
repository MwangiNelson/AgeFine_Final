"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { canTransitionBooking, type BookingStatus } from "@/lib/admin";

export async function updateBookingStatus(
  id: string,
  from: BookingStatus,
  to: BookingStatus
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!canTransitionBooking(from, to)) {
    return { ok: false, error: `Cannot move a booking from ${from} to ${to}.` };
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("bookings")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "The booking changed since you loaded it. Refresh and try again." };

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}
