/* ============================================================
   Admin domain logic — pure, unit-testable.
   ============================================================ */

/* ---------- Orders ---------- */

export const ORDER_STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Allowed transitions for an order status. The graph is now revertible —
 * forward moves are routine, while reverts and refunds are sensitive
 * (see SENSITIVE_TRANSITIONS) and gated to super-admins in the action layer.
 */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["fulfilled", "cancelled", "pending_payment", "refunded"],
  fulfilled: ["paid", "refunded"],
  cancelled: ["pending_payment"],
  refunded: ["paid"],
};

/**
 * Reverts (moving backward) and refunds. Allowed by the state machine but
 * restricted to super-admins and require a note for the audit trail.
 */
const SENSITIVE_TRANSITIONS: ReadonlyArray<`${OrderStatus}->${OrderStatus}`> = [
  "paid->pending_payment",
  "fulfilled->paid",
  "paid->refunded",
  "fulfilled->refunded",
  "refunded->paid",
  "cancelled->pending_payment",
];

export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[current] ?? [];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return nextOrderStatuses(from).includes(to);
}

/** True when a transition is a revert/refund — super-admin only, note required. */
export function isSensitiveTransition(from: OrderStatus, to: OrderStatus): boolean {
  return SENSITIVE_TRANSITIONS.includes(`${from}->${to}`);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/* ---------- Payments ---------- */

export const PAYMENT_STATUSES = ["pending", "submitted", "settled", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  settled: "Settled",
  failed: "Failed",
  refunded: "Refunded",
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

/** Bookable categories, shown as an icon picker in the service editor. */
export const SERVICE_CATEGORIES = [
  { value: "Facials & Glow", label: "Facials & Glow", icon: "sparkle" },
  { value: "Clinical Treatments", label: "Clinical Treatments", icon: "syringe" },
  { value: "Advanced Aesthetics", label: "Advanced Aesthetics", icon: "gem" },
  { value: "Consultation", label: "Consultation", icon: "chat" },
] as const;

/** Duration slider bounds (minutes). Services span a short, sensible range. */
export const DURATION_MIN_MINUTES = 15;
export const DURATION_MAX_MINUTES = 240;
export const DURATION_STEP_MINUTES = 15;

/** "1 h 30 m" / "45 m" — friendly label for the duration slider. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} h` : null, m ? `${m} m` : null].filter(Boolean).join(" ") || "0 m";
}

export interface ServiceFormInput {
  name: string;
  slug?: string;
  category?: string;
  /** Rich-text HTML from the editor. */
  description?: string;
  duration_min: number | string;
  /** Empty string = "priced on consultation" (stored as null). */
  price_kes?: number | string;
  active?: boolean;
  image_url?: string | null;
  gallery_urls?: string[];
}

export type ServiceErrors = Partial<Record<"name" | "duration_min" | "price_kes", string>>;

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

  return errors;
}

export function isServiceValid(errors: ServiceErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Build the DB row from validated form input (defaults applied, slug derived).
 * `featured` and `sort_order` are intentionally omitted — they're managed by
 * drag-and-drop on the services board, not the editor, so the editor must not
 * clobber them on update.
 */
export function buildServicePayload(input: ServiceFormInput) {
  const name = input.name.trim();
  return {
    name,
    slug: (input.slug?.trim() || slugify(name)),
    category: input.category?.trim() || "Treatments",
    description: input.description?.trim() || null,
    duration_min: Number(input.duration_min),
    price_kes: input.price_kes === undefined || input.price_kes === "" ? null : Number(input.price_kes),
    active: input.active ?? true,
    image_url: input.image_url || null,
    gallery_urls: input.gallery_urls ?? [],
  };
}

/** Strip HTML tags and collapse whitespace — plain text from rich content. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** A short plain-text preview from rich (or plain) description text. */
export function excerpt(html: string | null | undefined, max = 140): string {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "").trimEnd() + "…";
}
