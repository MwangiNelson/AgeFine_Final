import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// Home is an async server component that reads products from Supabase.
// Stub the client so the test runs without a network call.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }),
  },
}));

import Home from "@/app/page";
import { CartProvider } from "@/lib/cart-context";

async function renderHome() {
  // Resolve the async server component to its element tree, then render.
  const ui = await Home();
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("Home page", () => {
  it("renders a single h1 hero heading", async () => {
    const { getAllByRole } = await renderHome();
    expect(getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("has a skip-to-content link", async () => {
    const { getByText } = await renderHome();
    expect(getByText("Skip to content")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = await renderHome();
    expect(await axe(container)).toHaveNoViolations();
  });
});
