import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import AddToCartButton from "@/components/AddToCartButton";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { supabase } from "@/lib/supabaseClient";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products").select("name, description, image_urls, price_kes").eq("slug", slug).eq("active", true).maybeSingle();
  if (!product) return { title: "Product not found" };
  const desc = product.description ?? `${product.name} — KES ${product.price_kes.toLocaleString()} at ${SITE.name}, Nairobi.`;
  const img = product.image_urls?.[0];
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${SITE.name}`,
      description: desc,
      url: `/shop/${slug}`,
      images: img ? [{ url: img, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (!product) notFound();

  const img = product.image_urls?.[0];
  const inStock = product.stock > 0;

  return (
    <SiteShell>
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={img}
        priceKes={product.price_kes}
        slug={product.slug}
        inStock={inStock}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/shop/${product.slug}` },
        ]}
      />
      <div className="mx-auto px-6 md:px-8 pt-6 md:pt-12" style={{ maxWidth: "var(--container)" }}>
        <Link href="/shop" className="font-sans text-[11px] tracking-[0.12em] uppercase text-gold-text no-underline hover:text-plum transition-colors">
          &larr; Back to shop
        </Link>
      </div>

      <div className="mx-auto px-6 md:px-8 py-6 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start" style={{ maxWidth: "var(--container)" }}>
        {/* Image */}
        <div
          className="aspect-square rounded-xl overflow-hidden flex items-center justify-center md:sticky md:top-28"
          style={{
            backgroundColor: "var(--blush)",
            backgroundImage: img ? `url(${img})` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!img && (
            <span className="font-serif italic text-[15px]" style={{ color: "rgba(60,35,49,0.32)" }}>
              product photo
            </span>
          )}
        </div>

        {/* Info */}
        <div className="md:py-4">
          <h1 className="font-serif font-medium text-plum leading-[1.05] text-[34px] md:text-[46px]">
            {product.name}
          </h1>
          <p className="font-sans text-plum-soft mt-3 mb-1 text-lg md:text-xl">
            KES {product.price_kes.toLocaleString()}
          </p>
          <p className="font-sans text-[12px] tracking-[0.1em] uppercase mb-6" style={{ color: inStock ? "var(--gold-text)" : "var(--rose)" }}>
            {inStock ? "In stock" : "Currently unavailable"}
          </p>

          {product.description && (
            <p className="font-sans font-light text-ink leading-[1.75] text-[15px] md:text-base mb-8 max-w-[52ch]">
              {product.description}
            </p>
          )}

          <AddToCartButton
            item={{ id: product.id, slug: product.slug, name: product.name, price_kes: product.price_kes, image: img }}
            full
            label="Add to bag"
            disabled={!inStock}
          />

          <ul className="list-none p-0 mt-8 flex flex-col gap-3 border-t pt-7" style={{ borderColor: "var(--line)" }}>
            {[
              "Complimentary delivery within Nairobi",
              "Dermatologist-led formulations",
              "Cruelty free",
            ].map((line) => (
              <li key={line} className="flex items-center gap-3 font-sans text-sm text-plum-soft">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
