import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/checkout" }));

const singleMock = vi.fn(() => Promise.resolve({ data: { id: "abcd1234-0000-0000-0000-000000000000" }, error: null }));
const insertMock = vi.fn((payload: Record<string, unknown>) => {
  void payload;
  return { select: () => ({ single: singleMock }) };
});
vi.mock("@/lib/supabaseClient", () => ({
  supabase: { from: () => ({ insert: insertMock }) },
}));

import CheckoutPage from "@/app/checkout/page";
import { CartProvider } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart";
import { renderWithCart } from "./helpers/render-with-cart";

const serum: CartItem = { id: "p1", slug: "serum", name: "Glow serum", price_kes: 2400, qty: 1 };

function renderCheckout(items: CartItem[]) {
  return renderWithCart(<CheckoutPage />, items);
}

beforeEach(() => {
  window.localStorage.clear();
  insertMock.mockClear();
  singleMock.mockClear();
});

describe("Checkout page", () => {
  it("shows an empty guard when the cart is empty", () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );
    expect(screen.getByText(/your bag is empty/i)).toBeInTheDocument();
  });

  it("blocks order placement when required fields are missing", async () => {
    renderCheckout([serum]);
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("places a valid order and renders the confirmation with payment + WhatsApp", async () => {
    renderCheckout([serum]);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Asha Mwangi" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "0712345678" } });
    fireEvent.change(screen.getByLabelText(/delivery address/i), { target: { value: "12 Riverside, Nairobi" } });
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));

    // Confirmation screen
    expect(await screen.findByText(/order received/i)).toBeInTheDocument();
    expect(screen.getByText(/#abcd1234/i)).toBeInTheDocument();
    // payment amount shown
    expect(screen.getByText(/KES 2,400/)).toBeInTheDocument();
    // WhatsApp confirm link present
    const wa = screen.getByRole("link", { name: /confirm payment on whatsapp/i });
    expect(wa).toHaveAttribute("href", expect.stringContaining("https://wa.me/"));

    // Order payload matches RLS contract
    const payload = insertMock.mock.calls[0][0];
    expect(payload.delivery_method).toBe("delivery");
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.total_kes).toBe(2400);
    expect(payload.status).toBe("pending_payment");
  });

  it("has no detectable accessibility violations on the form", async () => {
    const { container } = renderCheckout([serum]);
    expect(await axe(container)).toHaveNoViolations();
  });
});
