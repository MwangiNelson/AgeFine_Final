/* ============================================================
   Admin domain logic — pure, unit-testable.
   ============================================================ */

/* ---------- Orders ---------- */

export const ORDER_STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Allowed forward/again transitions for an order status.
 * - pending_payment → paid | cancelled
 * - paid           → fulfilled | cancelled
 * - fulfilled      → (terminal)
 * - cancelled      → (terminal)
 */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
};

export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[current] ?? [];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return nextOrderStatuses(from).includes(to);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

/* ---------- Bookings ---------- */

export const BOOKING_STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  new: ["contacted", "confirmed", "cancelled"],
  contacted: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function nextBookingStatuses(current: BookingStatus): BookingStatus[] {
  return BOOKING_TRANSITIONS[current] ?? [];
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return nextBookingStatuses(from).includes(to);
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/* ---------- Applications (careers + training) ---------- */

export const APPLICATION_STATUSES = ["new", "reviewed", "contacted", "closed"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  new: ["reviewed", "contacted", "closed"],
  reviewed: ["contacted", "closed"],
  contacted: ["closed"],
  closed: [],
};

export function nextApplicationStatuses(current: ApplicationStatus): ApplicationStatus[] {
  return APPLICATION_TRANSITIONS[current] ?? [];
}

export function canTransitionApplication(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return nextApplicationStatuses(from).includes(to);
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  closed: "Closed",
};

/* ---------- Products ---------- */

export interface ProductFormInput {
  name: string;
  slug?: string;
  description?: string;
  price_kes: number | string;
  category_id?: string | null;
  stock?: number | string;
  active?: boolean;
  image_urls?: string[];
}

export type ProductErrors = Partial<Record<"name" | "price_kes" | "stock", string>>;

/** URL-safe slug from a product name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateProduct(input: ProductFormInput): ProductErrors {
  const errors: ProductErrors = {};

  if (!input.name?.trim()) errors.name = "Name is required.";
  else if (input.name.trim().length > 200) errors.name = "Name is too long.";

  const price = Number(input.price_kes);
  if (input.price_kes === "" || Number.isNaN(price)) errors.price_kes = "Enter a price.";
  else if (price < 0) errors.price_kes = "Price can't be negative.";
  else if (!Number.isInteger(price)) errors.price_kes = "Price must be a whole number (KES).";

  if (input.stock !== undefined && input.stock !== "") {
    const stock = Number(input.stock);
    if (Number.isNaN(stock) || stock < 0) errors.stock = "Stock can't be negative.";
    else if (!Number.isInteger(stock)) errors.stock = "Stock must be a whole number.";
  }

  return errors;
}

export function isProductValid(errors: ProductErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Build the DB row from validated form input (defaults applied, slug derived). */
export function buildProductPayload(input: ProductFormInput) {
  const name = input.name.trim();
  return {
    name,
    slug: (input.slug?.trim() || slugify(name)),
    description: input.description?.trim() || null,
    price_kes: Number(input.price_kes),
    category_id: input.category_id || null,
    stock: input.stock === undefined || input.stock === "" ? 0 : Number(input.stock),
    active: input.active ?? true,
    image_urls: input.image_urls ?? [],
  };
}

/* ---------- Services ---------- */

export interface ServiceFormInput {
  name: string;
  slug?: string;
  category?: string;
  tagline?: string;
  description?: string;
  /** One benefit per line in the form; arrays pass through unchanged. */
  benefits?: string | string[];
  duration_min: number | string;
  /** Empty string = "priced on consultation" (stored as null). */
  price_kes?: number | string;
  sort_order?: number | string;
  featured?: boolean;
  active?: boolean;
  image_url?: string | null;
  gallery_urls?: string[];
}

export type ServiceErrors = Partial<Record<"name" | "duration_min" | "price_kes" | "sort_order", string>>;

export function validateService(input: ServiceFormInput): ServiceErrors {
  const errors: ServiceErrors = {};

  if (!input.name?.trim()) errors.name = "Name is required.";
  else if (input.name.trim().length > 200) errors.name = "Name is too long.";

  const duration = Number(input.duration_min);
  if (input.duration_min === "" || Number.isNaN(duration)) errors.duration_min = "Enter a duration.";
  else if (!Number.isInteger(duration) || duration <= 0) errors.duration_min = "Duration must be a positive whole number of minutes.";

  if (input.price_kes !== undefined && input.price_kes !== "") {
    const price = Number(input.price_kes);
    if (Number.isNaN(price) || price < 0) errors.price_kes = "Price can't be negative.";
    else if (!Number.isInteger(price)) errors.price_kes = "Price must be a whole number (KES).";
  }

  if (input.sort_order !== undefined && input.sort_order !== "") {
    const sort = Number(input.sort_order);
    if (Number.isNaN(sort) || !Number.isInteger(sort)) errors.sort_order = "Sort order must be a whole number.";
  }

  return errors;
}

export function isServiceValid(errors: ServiceErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Normalize a textarea of benefits (one per line) into a clean array. */
export function parseBenefits(input: string | string[] | undefined): string[] {
  if (input === undefined) return [];
  const lines = Array.isArray(input) ? input : input.split("\n");
  return lines.map((l) => l.trim()).filter(Boolean);
}

/** Build the DB row from validated form input (defaults applied, slug derived). */
export function buildServicePayload(input: ServiceFormInput) {
  const name = input.name.trim();
  return {
    name,
    slug: (input.slug?.trim() || slugify(name)),
    category: input.category?.trim() || "Treatments",
    tagline: input.tagline?.trim() || null,
    description: input.description?.trim() || null,
    benefits: parseBenefits(input.benefits),
    duration_min: Number(input.duration_min),
    price_kes: input.price_kes === undefined || input.price_kes === "" ? null : Number(input.price_kes),
    sort_order: input.sort_order === undefined || input.sort_order === "" ? 0 : Number(input.sort_order),
    featured: input.featured ?? false,
    active: input.active ?? true,
    image_url: input.image_url || null,
    gallery_urls: input.gallery_urls ?? [],
  };
}
