import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

/** Supabase client for browser/client components (admin login, sign-out). */
export function createClient() {
  return createBrowserClient<Database>(url, anonKey);
}
