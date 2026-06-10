import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
