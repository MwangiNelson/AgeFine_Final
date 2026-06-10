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
      <div role="tablist" aria-label="Filter products by category" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 0 16px" }}>
        {tabs.map((c) => {
          const sel = active === c.id;
          return (
            <button key={c.id} role="tab" aria-selected={sel} onClick={() => setActive(c.id)} style={{ whiteSpace: "nowrap", fontFamily: "var(--sans)", fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 2, cursor: "pointer", border: "1px solid", borderColor: sel ? "var(--plum)" : "var(--line)", background: sel ? "var(--plum)" : "transparent", color: sel ? "var(--ivory)" : "var(--plum-soft)" }}>{c.name}</button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: "var(--plum-soft)", fontFamily: "var(--sans)", fontSize: 14, padding: "24px 0" }}>No products in this category yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {filtered.map((p, i) => <ProductGridCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
