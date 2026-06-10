import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ShopGrid from "@/components/ShopGrid";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Shop — Agefine Cosmetics" };

export default async function ShopPage() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);
  return (
    <>
      <Header />
      <main id="main" style={{ paddingBottom: 80 }}>
        <section style={{ padding: "32px 22px 8px" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--plum)", lineHeight: 1 }}>Shop</h1>
          <p style={{ fontFamily: "var(--sans)", fontWeight: 300, fontSize: 14, color: "var(--plum-soft)", marginTop: 8 }}>Skincare crafted for your glow.</p>
        </section>
        <section style={{ padding: "8px 22px 24px" }}>
          <ShopGrid products={products ?? []} categories={categories ?? []} />
        </section>
      </main>
      <BottomNav />
    </>
  );
}
