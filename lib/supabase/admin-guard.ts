import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** True when the user carries the admin role in app_metadata. */
export function isAdminUser(user: User | null): boolean {
  return !!user && user.app_metadata?.role === "admin";
}

/**
 * Server-side guard for admin pages. Returns the admin user, or redirects to
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
