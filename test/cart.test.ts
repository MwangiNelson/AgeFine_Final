import { describe, it, expect } from "vitest";
import { addItem, removeItem, setQty, cartTotal, cartCount, type CartItem } from "@/lib/cart";

const a: CartItem = { id: "a", slug: "a", name: "Serum", price_kes: 2400, qty: 1 };
const b: CartItem = { id: "b", slug: "b", name: "Mask", price_kes: 1500, qty: 2 };

describe("cart logic", () => {
  it("adds a new item", () => {
    expect(addItem([], a)).toHaveLength(1);
  });

  it("increments quantity for an existing item instead of duplicating", () => {
    const items = addItem([a], { ...a, qty: 1 });
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it("removes an item by id", () => {
    expect(removeItem([a, b], "a")).toEqual([b]);
  });

  it("sets quantity and removes when quantity drops to zero", () => {
    expect(setQty([a], "a", 5)[0].qty).toBe(5);
    expect(setQty([a], "a", 0)).toEqual([]);
  });

  it("computes total and count correctly", () => {
    const items = [a, b];
    expect(cartTotal(items)).toBe(2400 * 1 + 1500 * 2);
    expect(cartCount(items)).toBe(3);
  });
});
