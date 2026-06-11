import Link from "next/link";

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
      { label: "Services", href: "/services" },
      { label: "Book a consultation", href: "/services" },
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
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
            <p className="font-serif text-2xl tracking-[0.16em] text-plum m-0">AGEFINE</p>
            <p className="eyebrow mt-1.5">cosmetics &amp; skin clinic</p>
            <p className="font-sans font-light text-sm leading-relaxed text-plum-soft mt-5 max-w-[34ch]">
              Clinically considered skincare and expert beauty procedures, crafted for your
              natural glow. Visit our Nairobi clinic.
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
              Nairobi, Kenya
              <br />
              Mon–Sat · 9am–6pm
            </address>
            <a href="https://wa.me/" className="btn btn-outline mt-5 text-xs">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" />
              </svg>
              WhatsApp us
            </a>
          </div>
        </div>

        <div
          className="mt-12 md:mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "var(--line)" }}
        >
          <p className="font-sans text-xs text-plum-soft tracking-[0.04em] m-0">
            © 2026 Agefine Cosmetics · Nairobi, Kenya
          </p>
          <div className="flex items-center gap-4">
            <p className="font-sans text-xs text-plum-soft tracking-[0.04em] m-0">
              Dermatologist-led care · Cruelty free
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
