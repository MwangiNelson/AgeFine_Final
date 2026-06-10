export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: { id?: string; name?: string; slug?: string; created_at?: string };
        Relationships: [];
      };
      products: {
        Row: {
          id: string; name: string; slug: string; description: string | null;
          price_kes: number; category_id: string | null; image_urls: string[];
          stock: number; active: boolean; created_at: string;
        };
        Insert: {
          id?: string; name: string; slug: string; description?: string | null;
          price_kes: number; category_id?: string | null; image_urls?: string[];
          stock?: number; active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; name?: string; slug?: string; description?: string | null;
          price_kes?: number; category_id?: string | null; image_urls?: string[];
          stock?: number; active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string; customer_name: string; phone: string; delivery_method: string;
          address: string | null; notes: string | null; items: Json;
          total_kes: number; status: string; created_at: string;
        };
        Insert: {
          id?: string; customer_name: string; phone: string; delivery_method: string;
          address?: string | null; notes?: string | null; items?: Json;
          total_kes: number; status?: string; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string; name: string; phone: string; service: string;
          preferred_date: string | null; message: string | null; status: string; created_at: string;
        };
        Insert: {
          id?: string; name: string; phone: string; service: string;
          preferred_date?: string | null; message?: string | null; status?: string; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
