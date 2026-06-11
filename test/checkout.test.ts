import { describe, it, expect } from "vitest";
import {
  validateCheckout,
  isCheckoutValid,
  buildOrderPayload,
  toOrderItems,
  buildWhatsAppLink,
  validateBooking,
  isBookingValid,
  buildBookingPayload,
  type CheckoutForm,
  type BookingForm,
} from "@/lib/checkout";
import type { CartItem } from "@/lib/cart";

const items: CartItem[] = [
  { id: "p1", slug: "serum", name: "Glow serum", price_kes: 2400, qty: 2 },
  { id: "p2", slug: "mask", name: "Clay mask", price_kes: 1500, qty: 1 },
];

const validForm: CheckoutForm = {
  customer_name: "Asha Mwangi",
  phone: "0712345678",
  delivery_method: "delivery",
  address: "12 Riverside Dr, Nairobi",
  notes: "Call on arrival",
};

describe("validateCheckout", () => {
  it("passes a fully valid delivery order", () => {
    expect(isCheckoutValid(validateCheckout(validForm, true))).toBe(true);
  });

  it("rejects an empty name (RLS: name >= 1)", () => {
    const e = validateCheckout({ ...validForm, customer_name: "  " }, true);
    expect(e.customer_name).toBeTruthy();
  });

  it("rejects a name over 200 chars (RLS: name <= 200)", () => {
    const e = validateCheckout({ ...validForm, customer_name: "a".repeat(201) }, true);
    expect(e.customer_name).toBeTruthy();
  });

  it("rejects a phone shorter than 5 chars (RLS: phone >= 5)", () => {
    const e = validateCheckout({ ...validForm, phone: "123" }, true);
    expect(e.phone).toBeTruthy();
  });

  it("rejects a phone longer than 20 chars (RLS: phone <= 20)", () => {
    const e = validateCheckout({ ...validForm, phone: "1".repeat(21) }, true);
    expect(e.phone).toBeTruthy();
  });

  it("rejects non-numeric phone input", () => {
    const e = validateCheckout({ ...validForm, phone: "0712-ABC" }, true);
    expect(e.phone).toBeTruthy();
  });

  it("accepts spaces and dashes in phone (normalized before length check)", () => {
    const e = validateCheckout({ ...validForm, phone: "0712 345 678" }, true);
    expect(e.phone).toBeUndefined();
  });

  it("requires an address only for delivery", () => {
    expect(validateCheckout({ ...validForm, address: "" }, true).address).toBeTruthy();
    expect(
      validateCheckout({ ...validForm, delivery_method: "pickup", address: "" }, true).address
    ).toBeUndefined();
  });

  it("flags an empty cart", () => {
    expect(isCheckoutValid(validateCheckout(validForm, false))).toBe(false);
  });
});

describe("toOrderItems", () => {
  it("maps cart items to the persisted line-item shape", () => {
    expect(toOrderItems(items)).toEqual([
      { product_id: "p1", name: "Glow serum", price_kes: 2400, qty: 2 },
      { product_id: "p2", name: "Clay mask", price_kes: 1500, qty: 1 },
    ]);
  });
});

describe("buildOrderPayload", () => {
  it("derives total from the cart, not the client", () => {
    const payload = buildOrderPayload(validForm, items);
    expect(payload.total_kes).toBe(2400 * 2 + 1500); // 6300
  });

  it("produces an items array (RLS: jsonb_typeof = 'array')", () => {
    expect(Array.isArray(buildOrderPayload(validForm, items).items)).toBe(true);
  });

  it("sets status to pending_payment", () => {
    expect(buildOrderPayload(validForm, items).status).toBe("pending_payment");
  });

  it("includes a client-supplied id so the insert needs no RETURNING/SELECT", () => {
    expect(buildOrderPayload(validForm, items, "fixed-id-123").id).toBe("fixed-id-123");
    // and auto-generates one when not provided
    expect(typeof buildOrderPayload(validForm, items).id).toBe("string");
  });

  it("normalizes the phone and trims the name", () => {
    const payload = buildOrderPayload(
      { ...validForm, customer_name: "  Asha  ", phone: "0712 345 678" },
      items
    );
    expect(payload.customer_name).toBe("Asha");
    expect(payload.phone).toBe("0712345678");
  });

  it("nulls the address on pickup and nulls empty notes", () => {
    const payload = buildOrderPayload(
      { customer_name: "A", phone: "0712345678", delivery_method: "pickup", address: "x", notes: "" },
      items
    );
    expect(payload.address).toBeNull();
    expect(payload.notes).toBeNull();
    expect(payload.delivery_method).toBe("pickup");
  });

  it("only ever uses an allowed delivery_method (RLS enum)", () => {
    expect(["delivery", "pickup"]).toContain(buildOrderPayload(validForm, items).delivery_method);
  });
});

describe("buildWhatsAppLink", () => {
  const link = buildWhatsAppLink({
    whatsappNumber: "254712345678",
    orderId: "abcd1234-5678-90ab-cdef-111122223333",
    items,
    total: 6300,
    customerName: "Asha Mwangi",
    tillNumber: "555888",
  });

  it("targets the correct wa.me number (digits only)", () => {
    expect(link.startsWith("https://wa.me/254712345678?text=")).toBe(true);
  });

  it("strips non-digits from the number", () => {
    const l = buildWhatsAppLink({
      whatsappNumber: "+254 712 345 678",
      orderId: "x",
      items,
      total: 1,
      customerName: "A",
    });
    expect(l.startsWith("https://wa.me/254712345678?text=")).toBe(true);
  });

  it("encodes order id, items, total and till in the message", () => {
    const decoded = decodeURIComponent(link.split("text=")[1]);
    expect(decoded).toContain("#abcd1234"); // short id
    expect(decoded).toContain("Glow serum");
    expect(decoded).toContain("KES 6,300");
    expect(decoded).toContain("555888");
    expect(decoded).toContain("Asha Mwangi");
  });

  it("omits the till line when no till is provided", () => {
    const l = buildWhatsAppLink({
      whatsappNumber: "254712345678",
      orderId: "abcd1234",
      items,
      total: 6300,
      customerName: "Asha",
    });
    expect(decodeURIComponent(l)).not.toContain("Buy Goods Till");
  });
});

describe("validateBooking / buildBookingPayload", () => {
  const validBooking: BookingForm = {
    name: "Asha Mwangi",
    phone: "0712345678",
    service: "HydraFacial",
    preferred_date: "2026-07-01",
    message: "Morning preferred",
  };

  it("passes a valid booking", () => {
    expect(isBookingValid(validateBooking(validBooking))).toBe(true);
  });

  it("requires name, phone and service (RLS rules)", () => {
    const e = validateBooking({ name: "", phone: "1", service: "" });
    expect(e.name).toBeTruthy();
    expect(e.phone).toBeTruthy();
    expect(e.service).toBeTruthy();
  });

  it("builds a payload with status 'new' and nulls empty optionals", () => {
    const payload = buildBookingPayload({ ...validBooking, preferred_date: "", message: "" });
    expect(payload.status).toBe("new");
    expect(payload.preferred_date).toBeNull();
    expect(payload.message).toBeNull();
    expect(payload.phone).toBe("0712345678");
  });
});
