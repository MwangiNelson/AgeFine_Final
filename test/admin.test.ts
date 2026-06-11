import { describe, it, expect } from "vitest";
import {
  nextOrderStatuses,
  canTransitionOrder,
  nextBookingStatuses,
  canTransitionBooking,
  slugify,
  validateProduct,
  isProductValid,
  buildProductPayload,
  ORDER_STATUSES,
  BOOKING_STATUSES,
} from "@/lib/admin";

describe("order status transitions", () => {
  it("allows pending_payment → paid | cancelled", () => {
    expect(nextOrderStatuses("pending_payment").sort()).toEqual(["cancelled", "paid"]);
    expect(canTransitionOrder("pending_payment", "paid")).toBe(true);
    expect(canTransitionOrder("pending_payment", "cancelled")).toBe(true);
  });

  it("allows paid → fulfilled | cancelled", () => {
    expect(canTransitionOrder("paid", "fulfilled")).toBe(true);
    expect(canTransitionOrder("paid", "cancelled")).toBe(true);
  });

  it("forbids illegal jumps", () => {
    expect(canTransitionOrder("pending_payment", "fulfilled")).toBe(false);
    expect(canTransitionOrder("paid", "pending_payment")).toBe(false);
  });

  it("treats fulfilled and cancelled as terminal", () => {
    expect(nextOrderStatuses("fulfilled")).toEqual([]);
    expect(nextOrderStatuses("cancelled")).toEqual([]);
  });

  it("every status is part of the machine", () => {
    ORDER_STATUSES.forEach((s) => expect(Array.isArray(nextOrderStatuses(s))).toBe(true));
  });
});

describe("booking status transitions", () => {
  it("allows new → contacted | confirmed | cancelled", () => {
    expect(nextBookingStatuses("new").sort()).toEqual(["cancelled", "confirmed", "contacted"]);
  });

  it("allows confirmed → completed | cancelled", () => {
    expect(canTransitionBooking("confirmed", "completed")).toBe(true);
    expect(canTransitionBooking("confirmed", "cancelled")).toBe(true);
  });

  it("forbids reopening a completed booking", () => {
    expect(nextBookingStatuses("completed")).toEqual([]);
    expect(canTransitionBooking("completed", "new")).toBe(false);
  });

  it("every status is part of the machine", () => {
    BOOKING_STATUSES.forEach((s) => expect(Array.isArray(nextBookingStatuses(s))).toBe(true));
  });
});

describe("slugify", () => {
  it("lowercases, trims and dashes", () => {
    expect(slugify("  Vitamin C Glow Serum ")).toBe("vitamin-c-glow-serum");
  });
  it("strips quotes and symbols", () => {
    // Apostrophes are removed (clay's → clays); other symbols become a single dash.
    expect(slugify("Rose & Clay's \"Mask\"!")).toBe("rose-clays-mask");
  });
});

describe("validateProduct", () => {
  const base = { name: "Serum", price_kes: 2400 };

  it("passes a valid product", () => {
    expect(isProductValid(validateProduct(base))).toBe(true);
  });
  it("requires a name", () => {
    expect(validateProduct({ ...base, name: "  " }).name).toBeTruthy();
  });
  it("rejects a negative or non-integer price", () => {
    expect(validateProduct({ ...base, price_kes: -1 }).price_kes).toBeTruthy();
    expect(validateProduct({ ...base, price_kes: 99.5 }).price_kes).toBeTruthy();
    expect(validateProduct({ ...base, price_kes: "" }).price_kes).toBeTruthy();
  });
  it("rejects negative stock", () => {
    expect(validateProduct({ ...base, stock: -3 }).stock).toBeTruthy();
  });
});

describe("buildProductPayload", () => {
  it("derives a slug from the name when blank", () => {
    const p = buildProductPayload({ name: "Hydra Repair Cream", price_kes: "1950" });
    expect(p.slug).toBe("hydra-repair-cream");
    expect(p.price_kes).toBe(1950);
  });
  it("honours an explicit slug and defaults stock/active/images", () => {
    const p = buildProductPayload({ name: "X", slug: "custom-slug", price_kes: 100 });
    expect(p.slug).toBe("custom-slug");
    expect(p.stock).toBe(0);
    expect(p.active).toBe(true);
    expect(p.image_urls).toEqual([]);
  });
  it("nulls empty description and category", () => {
    const p = buildProductPayload({ name: "X", price_kes: 1, description: "  ", category_id: "" });
    expect(p.description).toBeNull();
    expect(p.category_id).toBeNull();
  });
});
