/* ============================================================
   Site-wide configuration: SEO + business details.
   SINGLE SOURCE OF TRUTH — every metadata tag, structured-data
   block, footer link and contact detail reads from here.

   Business details sourced from the client's live Instagram
   profile (@agefine_beauty) and posts, June 2026.
   ============================================================ */

/**
 * Canonical production origin. Set NEXT_PUBLIC_SITE_URL in the environment
 * (e.g. https://agefine.co.ke). Falls back to the Vercel deployment URL, then
 * to a placeholder for local/dev.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "") ||
  "https://agefine.co.ke"
).replace(/\/$/, "");

export const SITE = {
  name: "Agefine Beauty Lab & Clinic",
  shortName: "Agefine",
  legalName: "Agefine Beauty Lab & Clinic",
  tagline: "Where Science Speaks, Aesthetics Listens",
  motto: "Treat · Resolve · Maintain",
  description:
    "Anti-ageing and aesthetic skin solutions at Imaara Shopping Mall, Nairobi — chemical peels, microneedling, LED therapy, HydraFacials and more, led by dermatology, nutrition and cosmetic experts. Shop online or book a procedure.",
  locale: "en_KE",
  url: SITE_URL,

  // ---- Business / contact ----
  // Main clinic line (from the Instagram bio).
  phone: "+254746285020",
  // Bookings / consultations line — also the WhatsApp number used across
  // their posts ("Book your consultation Call/WhatsApp +254 716 290 865").
  bookingPhone: "+254716290865",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "254716290865",
  email: "hello@agefine.co.ke",
  address: {
    streetAddress: "Imaara Shopping Mall, 2nd Floor, Mombasa Road",
    locality: "Nairobi",
    region: "Nairobi",
    postalCode: "",
    country: "KE",
  },
  /**
   * Approximate clinic coordinates (Imaara Shopping Mall, Mombasa Road / Imara Daima).
   * Used only for structured data; the customer-facing directions links
   * resolve by place name, so they always land on the right pin.
   */
  geo: { latitude: -1.3266, longitude: 36.8682 },
  openingHours: [
    // Schema.org opening-hours specs.
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "18:00" },
  ],
  openingHoursHuman: "Mon–Sat · 9am–6pm",

  // ---- Social profiles ----
  social: {
    instagram: "https://www.instagram.com/agefine_beauty/",
    facebook: "https://www.facebook.com/agefinebeauty/",
    tiktok: "",
  },
} as const;

/** wa.me deep link to the business WhatsApp, with optional prefilled text. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** All non-empty social URLs, for schema sameAs + footer rendering. */
export function socialLinks(): string[] {
  return Object.values(SITE.social).filter(Boolean);
}

/** Absolute URL for a path on the site. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ---- Maps / directions (resolve by place name — no API key needed) ---- */

// Resolve by the mall's registered place name (not the business name, which
// is not yet a Google place) so directions/search always land on a real pin.
const MAPS_QUERY = "Imaara Shopping Mall, Mombasa Road, Nairobi";

/** Google Maps place search — opens the clinic pin. */
export function mapsSearchUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`;
}

/** Google Maps turn-by-turn directions to the clinic. */
export function mapsDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;
}

/** Keyless Google Maps embed for the find-us map. */
export function mapsEmbedUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&z=15&output=embed`;
}
