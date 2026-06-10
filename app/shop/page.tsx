import SiteShell from "@/components/SiteShell";
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
    <SiteShell>
      <section className="mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-2 md:pb-4" style={{ maxWidth: "var(--container)" }}>
        <p className="eyebrow mb-3" style={{ color: "var(--rose)" }}>The collection</p>
        <h1 className="section-title text-[40px] md:text-[56px]">Shop</h1>
        <p className="font-sans font-light text-plum-soft mt-3 text-[15px] md:text-base max-w-[42ch]">
          Skincare crafted for your glow — formulated and selected by our clinical team.
        </p>
      </section>
      <section className="mx-auto px-6 md:px-8 pt-6 pb-16 md:pb-24" style={{ maxWidth: "var(--container)" }}>
        <ShopGrid products={products ?? []} categories={categories ?? []} />
      </section>
    </SiteShell>
  );
}
