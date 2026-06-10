"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart";

export default function AddToCartButton({
  item, label = "Add to bag", full = false, disabled = false,
}: { item: Omit<CartItem, "qty">; label?: string; full?: boolean; disabled?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ ...item, qty: 1 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`btn btn-primary ${full ? "w-full" : ""}`}
    >
      {added ? (
        <>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5L20 7" />
          </svg>
          Added to bag
        </>
      ) : (
        label
      )}
    </button>
  );
}
