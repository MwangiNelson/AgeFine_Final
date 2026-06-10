"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [added, setAdded] = useState(false);
  const img = product.image_urls?.[0];

  function handleAdd() {
    addItem({ id: product.id, slug: product.slug, name: product.name, price_kes: product.price_kes, image: img, qty: 1 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="no-underline text-inherit block">
        <div
          className="relative aspect-[3/4] rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-1"
          style={{
            background: img ? undefined : GRADS[index % GRADS.length],
            backgroundImage: img ? `url(${img})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!img && (
            <span className="font-serif italic text-[13px]" style={{ color: "rgba(60,35,49,0.32)" }}>
              product photo
            </span>
          )}
          {/* subtle hover veil on desktop */}
          <span aria-hidden="true" className="absolute inset-0 bg-plum/0 group-hover:bg-plum/5 transition-colors duration-500" />
        </div>
        <h3 className="font-sans font-normal text-ink mt-3 mb-1 tracking-[0.02em] text-sm md:text-[15px]">
          {product.name}
        </h3>
      </Link>
      <div className="flex items-center justify-between">
        <span className="text-plum-soft tracking-[0.05em] text-[13px] md:text-sm">
          KES {product.price_kes.toLocaleString()}
        </span>
        <button
          type="button"
          aria-label={added ? `${product.name} added to bag` : `Add ${product.name} to bag`}
          onClick={handleAdd}
          className="flex items-center justify-center w-11 h-11 -mr-1.5 rounded-full text-ivory border-0 cursor-pointer transition-colors"
          style={{ background: added ? "var(--gold)" : "var(--plum)" }}
        >
          {added ? (
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12l5 5L20 7" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
