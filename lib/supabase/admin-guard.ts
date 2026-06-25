import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** Staff roles that may access the admin area. 'admin' === super-admin (legacy). */
export type AdminRole = "super_admin" | "manager";

/** The role carried in app_metadata, normalised. `null` when not a staff member. */
export function getRole(user: User | null): AdminRole | null {
  const role = user?.app_metadata?.role;
  if (role === "admin" || role === "super_admin") return "super_admin";
  if (role === "manager") return "manager";
  return null;
}

/** True when the user is any staff member (super-admin or manager). */
export function isAdminUser(user: User | null): boolean {
  return getRole(user) !== null;
}

/** True when the user is a super-admin (full access, incl. deletes & accounts). */
export function isSuperAdminUser(user: User | null): boolean {
  return getRole(user) === "super_admin";
}

/**
 * Server-side guard for admin pages. Returns the staff user, or redirects to
 * the login page. Use at the top of every /admin server component as a second
 * layer of defense behind the middleware.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }
  return user as User;
}

/**
 * Guard for super-admin-only pages/actions (deletes, account management,
 * homepage featured changes). Non-super staff are bounced to the dashboard.
 */
export async function requireSuperAdmin(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) redirect("/admin/login");
  if (!isSuperAdminUser(user)) redirect("/admin");
  return user as User;
}
