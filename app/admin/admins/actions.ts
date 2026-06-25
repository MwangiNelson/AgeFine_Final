"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/supabase/admin-guard";
import { createAdminApiClient } from "@/lib/supabase/admin-api";
import { absoluteUrl } from "@/lib/site";
import type { AdminRole } from "@/lib/supabase/admin-guard";

export interface AdminActionState {
  ok?: boolean;
  error?: string;
  /** The invited member's email — echoed back for the success screen. */
  email?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

function normaliseRole(role: unknown): AdminRole | null {
  if (role === "admin" || role === "super_admin") return "super_admin";
  if (role === "manager") return "manager";
  return null;
}

/** All staff users (super-admins + managers), newest first. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  await requireSuperAdmin();
  const api = createAdminApiClient();
  const { data, error } = await api.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users
    .map((u) => {
      const role = normaliseRole(u.app_metadata?.role);
      return role && u.email
        ? { id: u.id, email: u.email, role, created_at: u.created_at }
        : null;
    })
    .filter((u): u is AdminUser => u !== null)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Invite a new staff member. Supabase sends the invitation email (its built-in
 * mailer — no custom SMTP/domain needed for low volume) with a secure link; the
 * member follows it to /admin/accept-invite and sets their own password. We
 * stamp their role into app_metadata straight after the invite is created.
 */
export async function createAdminUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireSuperAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const role = normaliseRole(formData.get("role"));

  if (!email) return { error: "Email is required." };
  if (!role) return { error: "Pick a role." };

  const api = createAdminApiClient();
  const { data, error } = await api.auth.admin.inviteUserByEmail(email, {
    redirectTo: absoluteUrl("/admin/accept-invite"),
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) return { error: "A user with that email already exists." };
    if (msg.includes("rate") || msg.includes("limit")) {
      return { error: "Supabase's email rate limit was hit. Wait a few minutes and retry, or configure custom SMTP for higher volume." };
    }
    return { error: error.message };
  }

  // The invite creates the user with no role; assign the chosen one now.
  if (data.user) {
    const { error: roleError } = await api.auth.admin.updateUserById(data.user.id, { app_metadata: { role } });
    if (roleError) return { error: `Invitation sent, but assigning their role failed: ${roleError.message}` };
  }

  revalidatePath("/admin/admins");
  return { ok: true, email };
}

/** Change a staff member's role. Blocks demoting yourself out of super-admin. */
export async function updateAdminRole(id: string, role: AdminRole): Promise<void> {
  const current = await requireSuperAdmin();
  if (id === current.id && role !== "super_admin") {
    throw new Error("You can't remove your own super-admin role.");
  }
  const api = createAdminApiClient();
  const { error } = await api.auth.admin.updateUserById(id, { app_metadata: { role } });
  if (error) throw error;
  revalidatePath("/admin/admins");
}

/** Remove a staff member entirely. Blocks deleting yourself. */
export async function deleteAdminUser(id: string): Promise<void> {
  const current = await requireSuperAdmin();
  if (id === current.id) throw new Error("You can't delete your own account.");
  const api = createAdminApiClient();
  const { error } = await api.auth.admin.deleteUser(id);
  if (error) throw error;
  revalidatePath("/admin/admins");
}
