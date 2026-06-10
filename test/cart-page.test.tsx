import { render, screen, fireEvent, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/cart" }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));

import CartPage from "@/app/cart/page";
import { CartProvider } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart";
import { renderWithCart } from "./helpers/render-with-cart";

const serum: CartItem = { id: "p1", slug: "serum", name: "Glow serum", price_kes: 2400, qty: 1 };
const mask: CartItem = { id: "p2", slug: "mask", name: "Clay mask", price_kes: 1500, qty: 2 };

function renderCart(items: CartItem[]) {
  return renderWithCart(<CartPage />, items);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Cart page", () => {
  it("shows an empty state with a shop link when there are no items", () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );
    expect(screen.getByText(/your bag is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse the collection/i })).toBeInTheDocument();
  });

  it("lists items with a line total and an overall total", () => {
    renderCart([serum, mask]);
    expect(screen.getByText("Glow serum")).toBeInTheDocument();
    expect(screen.getByText("Clay mask")).toBeInTheDocument();
    // overall total = 2400 + 1500*2 = 5400 (appears in subtotal + total)
    expect(screen.getAllByText("KES 5,400").length).toBeGreaterThan(0);
  });

  it("increments quantity when the + control is pressed", () => {
    renderCart([serum]);
    fireEvent.click(screen.getByRole("button", { name: /increase quantity of glow serum/i }));
    // qty went 1 -> 2, so line total = 4800 (shows as both line total and overall total)
    expect(screen.getAllByText("KES 4,800").length).toBeGreaterThan(0);
  });

  it("removes an item via the remove control", () => {
    renderCart([serum, mask]);
    fireEvent.click(screen.getByRole("button", { name: /remove glow serum from bag/i }));
    expect(screen.queryByText("Glow serum")).not.toBeInTheDocument();
    expect(screen.getByText("Clay mask")).toBeInTheDocument();
  });

  it("offers a proceed-to-checkout link when items exist", () => {
    renderCart([serum]);
    const summary = screen.getByRole("complementary", { name: /order summary/i });
    expect(within(summary).getByRole("link", { name: /proceed to checkout/i })).toHaveAttribute("href", "/checkout");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderCart([serum, mask]);
    expect(await axe(container)).toHaveNoViolations();
  });
});
