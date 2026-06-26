import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// Home is an async server component that reads products/services from
// Supabase. Stub the client with a thenable, self-returning builder so any
// chain of .eq().order().limit() resolves to empty data without a network call.
vi.mock("@/lib/supabaseClient", () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (resolve: (v: { data: never[]; error: null }) => unknown) =>
      Promise.resolve(resolve({ data: [], error: null })),
  };
  return { supabase: { from: () => builder } };
});

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
    // iframes: false — jsdom can't do the frame messaging axe uses to scan
    // the embedded map; the iframe's own a11y (title) is asserted separately.
    expect(await axe(container, { iframes: false })).toHaveNoViolations();
  });

  it("embeds the clinic map with an accessible title", async () => {
    const { container } = await renderHome();
    const frame = container.querySelector("iframe");
    expect(frame).not.toBeNull();
    expect(frame!.title).toMatch(/Imaara Shopping Mall/);
  });
});
