import { render } from "@testing-library/react";
import { CartProvider } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart";

// Must match the key the CartProvider hydrates from on mount.
const STORAGE_KEY = "agefine_cart_v1";

/**
 * Seeds the cart by priming localStorage before render, so the CartProvider
 * hydrates with these items on mount — no effects, no act() warnings.
 */
export function renderWithCart(ui: React.ReactNode, items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return render(<CartProvider>{ui}</CartProvider>);
}
