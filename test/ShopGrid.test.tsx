import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect } from "vitest";
import ShopGrid from "@/components/ShopGrid";
import { CartProvider } from "@/lib/cart-context";
import type { Product, Category } from "@/lib/supabaseClient";

function product(over: Partial<Product>): Product {
  return {
    id: "1", name: "Item", slug: "item", description: null, price_kes: 1000,
    category_id: null, image_urls: [], stock: 5, active: true, created_at: "now", ...over,
  };
}

const categories: Category[] = [
  { id: "c1", name: "Serums", slug: "serums", created_at: "now" },
  { id: "c2", name: "Masks", slug: "masks", created_at: "now" },
];
const products: Product[] = [
  product({ id: "p1", name: "Glow serum", slug: "glow-serum", category_id: "c1" }),
  product({ id: "p2", name: "Clay mask", slug: "clay-mask", category_id: "c2" }),
];

function renderGrid() {
  return render(
    <CartProvider>
      <ShopGrid products={products} categories={categories} />
    </CartProvider>
  );
}

describe("ShopGrid", () => {
  it("renders all products by default", () => {
    renderGrid();
    expect(screen.getByText("Glow serum")).toBeInTheDocument();
    expect(screen.getByText("Clay mask")).toBeInTheDocument();
  });

  it("filters products when a category tab is selected", () => {
    renderGrid();
    fireEvent.click(screen.getByRole("tab", { name: "Serums" }));
    expect(screen.getByText("Glow serum")).toBeInTheDocument();
    expect(screen.queryByText("Clay mask")).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderGrid();
    expect(await axe(container)).toHaveNoViolations();
  });
});
