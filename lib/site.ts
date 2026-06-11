/* ============================================================
   Site-wide configuration: SEO + business details.
   SINGLE SOURCE OF TRUTH — swap the PLACEHOLDER values below for
   the client's real details and every metadata tag, structured-data
   block, footer link and contact detail updates automatically.
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
  name: "Agefine Cosmetics",
  shortName: "Agefine",
  legalName: "Agefine Cosmetics",
  tagline: "Skin & Beauty Clinic, Nairobi",
  description:
    "Clinically considered skincare and expert beauty procedures, crafted for your natural glow. Shop online or book a procedure at our Nairobi clinic.",
  locale: "en_KE",
  url: SITE_URL,

  // ---- Business / contact (PLACEHOLDERS — replace with real details) ----
  // International phone, no spaces, leading + for tel:/schema.
  phone: "+254700000000",
  // WhatsApp number, digits only, no + (international). Mirrors NEXT_PUBLIC_WHATSAPP.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "254700000000",
  email: "hello@agefine.co.ke",
  address: {
    streetAddress: "PLACEHOLDER — street, building",
    locality: "Nairobi",
    region: "Nairobi",
    postalCode: "",
    country: "KE",
  },
  // Approx clinic geo (Nairobi CBD) — replace with the real clinic coordinates.
  geo: { latitude: -1.286389, longitude: 36.817223 },
  openingHours: [
    // Schema.org opening-hours specs.
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "18:00" },
  ],
  openingHoursHuman: "Mon–Sat · 9am–6pm",

  // ---- Social profiles (PLACEHOLDERS — replace or remove) ----
  social: {
    instagram: "https://instagram.com/agefinecosmetics",
    facebook: "https://facebook.com/agefinecosmetics",
    tiktok: "https://tiktok.com/@agefinecosmetics",
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
