import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import Home from "@/app/page";
import { CartProvider } from "@/lib/cart-context";

function renderHome() {
  return render(
    <CartProvider>
      <Home />
    </CartProvider>
  );
}

describe("Home page", () => {
  it("renders a single h1 hero heading", () => {
    const { getAllByRole } = renderHome();
    expect(getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("has a skip-to-content link", () => {
    const { getByText } = renderHome();
    expect(getByText("Skip to content")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderHome();
    expect(await axe(container)).toHaveNoViolations();
  });
});
