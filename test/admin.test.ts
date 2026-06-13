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

/* ---- additions: applications + services (content expansion) ---- */

import {
  nextApplicationStatuses,
  canTransitionApplication,
  APPLICATION_STATUSES,
  validateService,
  isServiceValid,
  buildServicePayload,
  parseBenefits,
} from "@/lib/admin";

describe("application status transitions", () => {
  it("allows new → reviewed | contacted | closed", () => {
    expect(nextApplicationStatuses("new").sort()).toEqual(["closed", "contacted", "reviewed"]);
  });

  it("allows reviewed → contacted | closed and contacted → closed", () => {
    expect(canTransitionApplication("reviewed", "contacted")).toBe(true);
    expect(canTransitionApplication("contacted", "closed")).toBe(true);
  });

  it("forbids moving backwards and treats closed as terminal", () => {
    expect(canTransitionApplication("contacted", "new")).toBe(false);
    expect(nextApplicationStatuses("closed")).toEqual([]);
  });

  it("every status is part of the machine", () => {
    APPLICATION_STATUSES.forEach((s) => expect(Array.isArray(nextApplicationStatuses(s))).toBe(true));
  });
});

describe("validateService", () => {
  const valid = { name: "Chemical Peels", duration_min: 45 };

  it("passes a minimal valid service", () => {
    expect(isServiceValid(validateService(valid))).toBe(true);
  });

  it("requires a name", () => {
    expect(validateService({ ...valid, name: " " }).name).toBeTruthy();
  });

  it("requires a positive whole-number duration", () => {
    expect(validateService({ ...valid, duration_min: "" }).duration_min).toBeTruthy();
    expect(validateService({ ...valid, duration_min: 0 }).duration_min).toBeTruthy();
    expect(validateService({ ...valid, duration_min: 12.5 }).duration_min).toBeTruthy();
  });

  it("allows a blank price (priced on consultation) but rejects negatives", () => {
    expect(isServiceValid(validateService({ ...valid, price_kes: "" }))).toBe(true);
    expect(validateService({ ...valid, price_kes: -1 }).price_kes).toBeTruthy();
  });
});

describe("buildServicePayload", () => {
  it("derives slug, parses benefits lines, and nulls a blank price", () => {
    const payload = buildServicePayload({
      name: "  LED Light Therapy ",
      duration_min: "30",
      price_kes: "",
      benefits: "Calms acne\n\n  Boosts collagen  \n",
      featured: true,
    });
    expect(payload.slug).toBe("led-light-therapy");
    expect(payload.benefits).toEqual(["Calms acne", "Boosts collagen"]);
    expect(payload.price_kes).toBeNull();
    expect(payload.featured).toBe(true);
    expect(payload.category).toBe("Treatments");
  });

  it("keeps an explicit slug and integer price", () => {
    const payload = buildServicePayload({ name: "Peels", slug: "chemical-peels", duration_min: 45, price_kes: 4500 });
    expect(payload.slug).toBe("chemical-peels");
    expect(payload.price_kes).toBe(4500);
  });
});

describe("parseBenefits", () => {
  it("handles arrays, strings and undefined", () => {
    expect(parseBenefits(undefined)).toEqual([]);
    expect(parseBenefits(["a", " b "])).toEqual(["a", "b"]);
    expect(parseBenefits("a\nb")).toEqual(["a", "b"]);
  });
});
