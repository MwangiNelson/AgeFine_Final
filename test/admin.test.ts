import { describe, it, expect } from "vitest";
import {
  nextOrderStatuses,
  canTransitionOrder,
  isSensitiveTransition,
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
    expect(canTransitionOrder("pending_payment", "refunded")).toBe(false);
  });

  it("allows reverts and refunds (now revertible)", () => {
    expect(canTransitionOrder("fulfilled", "paid")).toBe(true);
    expect(canTransitionOrder("paid", "pending_payment")).toBe(true);
    expect(canTransitionOrder("paid", "refunded")).toBe(true);
    expect(canTransitionOrder("cancelled", "pending_payment")).toBe(true);
  });

  it("still forbids nonsensical jumps", () => {
    expect(canTransitionOrder("pending_payment", "fulfilled")).toBe(false);
    expect(canTransitionOrder("cancelled", "fulfilled")).toBe(false);
  });

  it("every status is part of the machine", () => {
    ORDER_STATUSES.forEach((s) => expect(Array.isArray(nextOrderStatuses(s))).toBe(true));
  });
});

describe("isSensitiveTransition", () => {
  it("flags reverts and refunds as sensitive (super-admin only)", () => {
    expect(isSensitiveTransition("fulfilled", "paid")).toBe(true);
    expect(isSensitiveTransition("paid", "refunded")).toBe(true);
    expect(isSensitiveTransition("cancelled", "pending_payment")).toBe(true);
  });
  it("treats forward moves as routine", () => {
    expect(isSensitiveTransition("pending_payment", "paid")).toBe(false);
    expect(isSensitiveTransition("paid", "fulfilled")).toBe(false);
    expect(isSensitiveTransition("paid", "cancelled")).toBe(false);
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
  excerpt,
  stripHtml,
  formatDuration,
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
  it("derives slug, defaults category/active, and nulls a blank price", () => {
    const payload = buildServicePayload({
      name: "  LED Light Therapy ",
      duration_min: "30",
      price_kes: "",
    });
    expect(payload.slug).toBe("led-light-therapy");
    expect(payload.price_kes).toBeNull();
    expect(payload.category).toBe("Treatments");
    expect(payload.active).toBe(true);
    expect(payload.duration_min).toBe(30);
  });

  it("keeps an explicit slug and integer price, and honours active=false (draft)", () => {
    const payload = buildServicePayload({ name: "Peels", slug: "chemical-peels", duration_min: 45, price_kes: 4500, active: false });
    expect(payload.slug).toBe("chemical-peels");
    expect(payload.price_kes).toBe(4500);
    expect(payload.active).toBe(false);
  });

  it("does not write board-managed featured/sort_order fields", () => {
    const payload = buildServicePayload({ name: "X", duration_min: 30 });
    expect(payload).not.toHaveProperty("featured");
    expect(payload).not.toHaveProperty("sort_order");
  });
});

describe("rich-text helpers", () => {
  it("stripHtml removes tags and decodes common entities", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    expect(stripHtml("<p>A &amp; B</p>")).toBe("A & B");
    expect(stripHtml(null)).toBe("");
  });

  it("excerpt truncates on a word boundary with an ellipsis", () => {
    expect(excerpt("<p>Short text</p>")).toBe("Short text");
    const long = "<p>" + "word ".repeat(50) + "</p>";
    const out = excerpt(long, 20);
    expect(out.length).toBeLessThanOrEqual(21);
    expect(out.endsWith("…")).toBe(true);
  });

  it("formatDuration renders hours and minutes", () => {
    expect(formatDuration(45)).toBe("45 m");
    expect(formatDuration(90)).toBe("1 h 30 m");
    expect(formatDuration(120)).toBe("2 h");
  });
});
