"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { canTransitionApplication, type ApplicationStatus } from "@/lib/admin";

export async function updateApplicationStatus(
  id: string,
  from: ApplicationStatus,
  to: ApplicationStatus
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!canTransitionApplication(from, to)) {
    return { ok: false, error: `Cannot move an application from ${from} to ${to}.` };
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("applications")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "The application changed since you loaded it. Refresh and try again." };

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true };
}
