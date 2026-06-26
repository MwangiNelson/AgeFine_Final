"use client";

import { useState } from "react";
import ProductGridCard from "./ProductGridCard";
import type { Product, Category } from "@/lib/supabaseClient";

export default function ShopGrid({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [active, setActive] = useState<string>("all");
  const filtered = active === "all" ? products : products.filter((p) => p.category_id === active);
  const tabs = [{ id: "all", name: "All" }, ...categories];

  return (
    <div>
      <div role="tablist" aria-label="Filter products by category" className="flex gap-2 md:gap-3 overflow-x-auto pb-5 md:pb-7 md:flex-wrap">
        {tabs.map((c) => {
          const sel = active === c.id;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={sel}
              type="button"
              onClick={() => setActive(c.id)}
              className="whitespace-nowrap font-sans text-[11.5px] md:text-xs tracking-[0.1em] uppercase px-4 py-2.5 rounded-full border cursor-pointer transition-colors"
              style={{
                minHeight: 40,
                borderColor: sel ? "var(--brand-blue)" : "var(--line)",
                background: sel ? "var(--brand-blue)" : "transparent",
                color: sel ? "#fff" : "var(--plum-soft)",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="font-sans text-plum-soft text-sm py-8">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9 md:gap-x-7 md:gap-y-12">
          {filtered.map((p, i) => (
            <ProductGridCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
