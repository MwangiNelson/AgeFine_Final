import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client — bypasses RLS and can use the Auth Admin API.
 * SERVER-ONLY: the service-role key must never reach the browser. Used by
 * super-admin-only account-management actions. Guard every caller with
 * requireSuperAdmin() before invoking.
 */
export function createAdminApiClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase URL or service-role key for account management.");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
