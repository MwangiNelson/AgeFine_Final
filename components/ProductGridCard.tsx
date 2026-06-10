"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/supabaseClient";

const GRADS = [
  "linear-gradient(150deg,#F0E2D6,#E3C7BE)",
  "linear-gradient(150deg,#ECE7DD,#D9C4A8)",
  "linear-gradient(150deg,#F3E0DE,#D7A9A2)",
  "linear-gradient(150deg,#E7E9E2,#C9C2AE)",
];

export default function ProductGridCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const img = product.image_urls?.[0];
  return (
    <div>
      <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 6, overflow: "hidden", background: img ? undefined : GRADS[index % GRADS.length], backgroundImage: img ? `url(${img})` : undefined, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!img && <span style={{ color: "rgba(60,35,49,0.32)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13 }}>product photo</span>}
        </div>
        <h3 style={{ fontFamily: "var(--sans)", fontWeight: 400, fontSize: 13.5, color: "var(--ink)", margin: "12px 0 4px", letterSpacing: "0.02em" }}>{product.name}</h3>
      </Link>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: "var(--plum-soft)", letterSpacing: "0.05em" }}>KES {product.price_kes.toLocaleString()}</span>
        <button aria-label={`Add ${product.name} to bag`} onClick={() => addItem({ id: product.id, slug: product.slug, name: product.name, price_kes: product.price_kes, image: img, qty: 1 })} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--plum)", color: "var(--ivory)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  );
}
