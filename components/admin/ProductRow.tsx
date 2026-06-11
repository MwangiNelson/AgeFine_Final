"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Product } from "@/lib/supabaseClient";
import { toggleProductActive, deleteProduct } from "@/app/admin/products/actions";

export default function ProductRow({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const img = product.image_urls?.[0];

  return (
    <li
      className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_140px_90px_120px_120px] gap-3 md:gap-4 items-center px-4 md:px-5 py-3.5 border-b last:border-b-0"
      style={{ borderColor: "var(--line)", opacity: pending ? 0.5 : 1 }}
    >
      {/* Product */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-none w-11 h-11 rounded-md bg-cover bg-center"
          style={{ background: img ? `url(${img}) center/cover` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)" }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <Link href={`/admin/products/${product.id}`} className="font-sans text-sm text-plum no-underline hover:text-rose transition-colors block truncate">
            {product.name}
          </Link>
          <span className="font-sans text-xs text-plum-soft md:hidden">
            KES {product.price_kes.toLocaleString()} · {product.active ? "Active" : "Hidden"}
          </span>
        </div>
      </div>

      {/* Category (desktop) */}
      <span className="hidden md:block font-sans text-sm text-plum-soft truncate">{categoryName ?? "—"}</span>

      {/* Price (desktop) */}
      <span className="hidden md:block font-sans text-sm text-plum">KES {product.price_kes.toLocaleString()}</span>

      {/* Status toggle (desktop) */}
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => startTransition(() => toggleProductActive(product.id, !product.active))}
          disabled={pending}
          aria-pressed={product.active}
          className="font-sans text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            borderColor: product.active ? "var(--gold)" : "var(--line)",
            background: product.active ? "var(--cream)" : "transparent",
            color: product.active ? "var(--gold-text)" : "var(--plum-soft)",
          }}
        >
          {product.active ? "Active" : "Hidden"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`} className="font-sans text-xs px-3 py-1.5 text-plum-soft hover:text-plum transition-colors no-underline">
          Edit
        </Link>
        {confirming ? (
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => startTransition(() => deleteProduct(product.id))}
              disabled={pending}
              className="font-sans text-xs px-2.5 py-1.5 rounded-md text-white"
              style={{ background: "#9b2c2c" }}
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="font-sans text-xs px-2 py-1.5 text-plum-soft">
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${product.name}`}
            className="font-sans text-xs px-3 py-1.5 text-plum-soft hover:text-rose transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
