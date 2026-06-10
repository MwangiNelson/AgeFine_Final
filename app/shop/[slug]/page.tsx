import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AddToCartButton from "@/components/AddToCartButton";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (!product) notFound();
  const img = product.image_urls?.[0];
  return (
    <>
      <Header />
      <main id="main" style={{ paddingBottom: 80 }}>
        <div style={{ aspectRatio: "1 / 1", backgroundColor: "var(--blush)", backgroundImage: img ? `url(${img})` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!img && <span style={{ color: "rgba(60,35,49,0.32)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15 }}>product photo</span>}
        </div>
        <section style={{ padding: "24px 26px" }}>
          <Link href="/shop" style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-text)", textDecoration: "none" }}>&larr; Back to shop</Link>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 32, color: "var(--plum)", margin: "14px 0 8px", lineHeight: 1.05 }}>{product.name}</h1>
          <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: "var(--plum-soft)", marginBottom: 18 }}>KES {product.price_kes.toLocaleString()}</p>
          {product.description && <p style={{ fontFamily: "var(--sans)", fontWeight: 300, fontSize: 14.5, lineHeight: 1.7, color: "var(--ink)", marginBottom: 26 }}>{product.description}</p>}
          <AddToCartButton item={{ id: product.id, slug: product.slug, name: product.name, price_kes: product.price_kes, image: img }} full label="Add to bag" />
        </section>
      </main>
      <BottomNav />
    </>
  );
}
