import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 8h2V5h-2a3 3 0 00-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8a1 1 0 011-1z" />
    </svg>
  ),
  tiktok: (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 4c.5 2.5 2 4 4.5 4.2M15 4v9.5a3.5 3.5 0 11-3.5-3.5" />
    </svg>
  ),
};

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Serums", href: "/shop" },
      { label: "Moisturisers", href: "/shop" },
      { label: "Cleansers", href: "/shop" },
    ],
  },
  {
    heading: "Clinic",
    links: [
      { label: "Treatments", href: "/services" },
      { label: "Book a consultation", href: "/services" },
      { label: "About us", href: "/about" },
      { label: "Careers & training", href: "/careers" },
      { label: "Contact & directions", href: "/contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-cream border-t" style={{ borderColor: "var(--line)" }}>
      <div className="mx-auto px-6 md:px-8 py-14 md:py-20" style={{ maxWidth: "var(--container)" }}>
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 md:gap-12">
          {/* Brand */}
          <div>
            <p className="font-serif text-2xl tracking-[0.16em] m-0"><span className="text-brand-blue">AGE</span><span className="text-brand-pink">FINE</span></p>
            <p className="eyebrow mt-1.5">beauty lab &amp; clinic</p>
            <p className="font-sans font-light text-sm leading-relaxed text-plum-soft mt-5 max-w-[34ch]">
              {SITE.tagline}. Anti-ageing and aesthetic skin solutions by dermatology,
              nutrition and cosmetic experts.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="eyebrow mb-4">{col.heading}</h2>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-plum-soft no-underline hover:text-plum transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Visit */}
          <div>
            <h2 className="eyebrow mb-4">Visit</h2>
            <address className="not-italic font-sans text-sm text-plum-soft leading-relaxed">
              {SITE.address.streetAddress}
              <br />
              {SITE.address.locality}, Kenya
              <br />
              {SITE.openingHoursHuman}
              <br />
              <a href={`tel:${SITE.bookingPhone}`} className="no-underline hover:text-plum transition-colors">
                {SITE.bookingPhone.replace("+254", "0")}
              </a>
            </address>
            <a href={whatsappLink()} className="btn btn-outline mt-5 text-xs">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" />
              </svg>
              WhatsApp us
            </a>

            {/* Social */}
            <ul className="list-none p-0 mt-6 flex items-center gap-3">
              {(Object.keys(SITE.social) as (keyof typeof SITE.social)[]).map((key) =>
                SITE.social[key] ? (
                  <li key={key}>
                    <a
                      href={SITE.social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${SITE.name} on ${key}`}
                      className="flex items-center justify-center w-10 h-10 rounded-full border text-plum-soft hover:text-brand-blue hover:border-brand-blue transition-colors"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {SOCIAL_ICONS[key]}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 md:mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "var(--line)" }}
        >
          <p className="font-sans text-xs text-plum-soft tracking-[0.04em] m-0">
            © 2026 {SITE.name} · Imaara Shopping Mall, Nairobi
          </p>
          <div className="flex items-center gap-4">
            <p className="font-sans text-xs text-plum-soft tracking-[0.04em] m-0">
              {SITE.motto}
            </p>
            <Link href="/admin" className="font-sans text-xs text-plum-soft tracking-[0.04em] no-underline hover:text-plum transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
