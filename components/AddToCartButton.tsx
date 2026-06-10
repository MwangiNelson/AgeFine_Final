"use client";

import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart";

export default function AddToCartButton({
  item, label = "Add to bag", full = false,
}: { item: Omit<CartItem, "qty">; label?: string; full?: boolean }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem({ ...item, qty: 1 })}
      style={{ fontFamily: "var(--sans)", fontSize: 12.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, padding: "14px 22px", borderRadius: 2, cursor: "pointer", background: "var(--plum)", color: "var(--ivory)", border: "1px solid var(--plum)", width: full ? "100%" : "auto" }}
    >
      {label}
    </button>
  );
}
