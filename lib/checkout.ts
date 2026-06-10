import type { CartItem } from "./cart";
import { cartTotal } from "./cart";
import type { OrderInsert } from "./supabaseClient";
import type { Json } from "./database.types";

/* ============================================================
   Checkout domain logic — pure, fully unit-testable.

   Validation here MUST mirror the Supabase RLS WITH CHECK on
   the `orders` table, otherwise inserts will be rejected:
     - customer_name: 1..200 chars
     - phone:         5..20 chars
     - total_kes:     >= 0
     - items:         JSON array
     - delivery_method in ('delivery','pickup')
   ============================================================ */

export type DeliveryMethod = "delivery" | "pickup";

export interface CheckoutForm {
  customer_name: string;
  phone: string;
  delivery_method: DeliveryMethod;
  address?: string;
  notes?: string;
}

/** One line item as persisted in orders.items (jsonb). */
export interface OrderLineItem {
  product_id: string;
  name: string;
  price_kes: number;
  qty: number;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const NAME_MIN = 1;
const NAME_MAX = 200;
const PHONE_MIN = 5;
const PHONE_MAX = 20;

/** Kenyan phone numbers: digits, optional leading +, spaces/dashes tolerated on input. */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "").trim();
}

/**
 * Validate the checkout form against the same rules the database enforces.
 * Returns a map of field -> message; empty object means valid.
 */
export function validateCheckout(form: CheckoutForm, hasItems: boolean): CheckoutErrors {
  const errors: CheckoutErrors = {};

  const name = form.customer_name?.trim() ?? "";
  if (name.length < NAME_MIN) errors.customer_name = "Please enter your name.";
  else if (name.length > NAME_MAX) errors.customer_name = "Name is too long.";

  const phone = normalizePhone(form.phone ?? "");
  if (phone.length < PHONE_MIN) errors.phone = "Please enter a valid phone number.";
  else if (phone.length > PHONE_MAX) errors.phone = "Phone number is too long.";
  else if (!/^\+?\d+$/.test(phone)) errors.phone = "Phone number can only contain digits.";

  if (form.delivery_method !== "delivery" && form.delivery_method !== "pickup") {
    errors.delivery_method = "Choose delivery or pickup.";
  }

  if (form.delivery_method === "delivery" && !(form.address ?? "").trim()) {
    errors.address = "A delivery address is required.";
  }

  if (!hasItems) {
    // Surfaced on the form generally; cart guard also prevents this.
    errors.customer_name = errors.customer_name ?? "Your bag is empty.";
  }

  return errors;
}

export function isCheckoutValid(errors: CheckoutErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Map cart items to the persisted order line-item shape. */
export function toOrderItems(items: CartItem[]): OrderLineItem[] {
  return items.map((i) => ({
    product_id: i.id,
    name: i.name,
    price_kes: i.price_kes,
    qty: i.qty,
  }));
}

/**
 * Build the exact row to insert into `orders`. Trims/normalizes inputs and
 * derives the total from the cart (never trusts a client-passed total).
 * Optional fields that are empty are sent as null to match the schema.
 */
export function buildOrderPayload(form: CheckoutForm, items: CartItem[]): OrderInsert {
  const address = (form.address ?? "").trim();
  const notes = (form.notes ?? "").trim();

  return {
    customer_name: form.customer_name.trim(),
    phone: normalizePhone(form.phone),
    delivery_method: form.delivery_method,
    address: form.delivery_method === "delivery" && address ? address : null,
    notes: notes || null,
    items: toOrderItems(items) as unknown as Json,
    total_kes: cartTotal(items),
    status: "pending_payment",
  };
}

export interface WhatsAppLinkArgs {
  /** Business WhatsApp number, international format, no '+' (e.g. 2547XXXXXXXX). */
  whatsappNumber: string;
  orderId: string;
  items: CartItem[];
  total: number;
  customerName: string;
  tillNumber?: string;
}

/**
 * Generate a WhatsApp deep link confirming the order. Used on the
 * confirmation screen so the customer can message the shop their order +
 * payment reference. Returns a wa.me URL with a URL-encoded prefilled text.
 */
export function buildWhatsAppLink({
  whatsappNumber,
  orderId,
  items,
  total,
  customerName,
  tillNumber,
}: WhatsAppLinkArgs): string {
  const lines = items.map((i) => `• ${i.qty} × ${i.name} — KES ${(i.price_kes * i.qty).toLocaleString()}`);
  const shortId = orderId.slice(0, 8);

  const message = [
    `Hi Agefine, I've placed an order (#${shortId}).`,
    "",
    `Name: ${customerName}`,
    "",
    "Items:",
    ...lines,
    "",
    `Total: KES ${total.toLocaleString()}`,
    tillNumber ? `Paid to Buy Goods Till ${tillNumber}.` : "",
  ]
    .filter((l) => l !== null && l !== undefined)
    .join("\n");

  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/* ============================================================
   Booking / contact form logic (inserts into `bookings`).
   RLS WITH CHECK on `bookings`:
     - name:    1..200 chars
     - phone:   5..20 chars
     - service: 1..200 chars
   ============================================================ */

export interface BookingForm {
  name: string;
  phone: string;
  service: string;
  preferred_date?: string;
  message?: string;
}

export type BookingErrors = Partial<Record<keyof BookingForm, string>>;

export function validateBooking(form: BookingForm): BookingErrors {
  const errors: BookingErrors = {};

  const name = form.name?.trim() ?? "";
  if (name.length < NAME_MIN) errors.name = "Please enter your name.";
  else if (name.length > NAME_MAX) errors.name = "Name is too long.";

  const phone = normalizePhone(form.phone ?? "");
  if (phone.length < PHONE_MIN) errors.phone = "Please enter a valid phone number.";
  else if (phone.length > PHONE_MAX) errors.phone = "Phone number is too long.";
  else if (!/^\+?\d+$/.test(phone)) errors.phone = "Phone number can only contain digits.";

  const service = form.service?.trim() ?? "";
  if (service.length < NAME_MIN) errors.service = "Please choose a service.";
  else if (service.length > NAME_MAX) errors.service = "Service name is too long.";

  return errors;
}

export function isBookingValid(errors: BookingErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Build the row to insert into `bookings`, normalizing empties to null. */
export function buildBookingPayload(form: BookingForm) {
  const message = (form.message ?? "").trim();
  const preferred = (form.preferred_date ?? "").trim();
  return {
    name: form.name.trim(),
    phone: normalizePhone(form.phone),
    service: form.service.trim(),
    preferred_date: preferred || null,
    message: message || null,
    status: "new",
  };
}
