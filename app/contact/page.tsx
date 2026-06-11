import SiteShell from "@/components/SiteShell";
import BookingFormCard from "@/components/BookingFormCard";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Agefine Cosmetics, Nairobi. Visit our skin clinic, message us on WhatsApp, or send an enquiry and we'll respond shortly.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact — Agefine Cosmetics", url: "/contact" },
};

const DETAILS = [
  {
    label: "Visit",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
    lines: [`${SITE.address.locality}, Kenya`, SITE.openingHoursHuman],
  },
  {
    label: "WhatsApp",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" />
      </svg>
    ),
    lines: ["Chat with our team", "Fastest response"],
    href: whatsappLink(),
  },
  {
    label: "Email",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M4 5h16v14H4z" /><path d="M4 7l8 6 8-6" />
      </svg>
    ),
    lines: [SITE.email],
    href: `mailto:${SITE.email}`,
  },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20 text-center" style={{ maxWidth: "680px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--rose)" }}>We&apos;d love to hear from you</p>
          <h1 className="section-title text-[42px] md:text-[60px]">Get in touch</h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-5 max-w-[44ch] mx-auto">
            Questions about a product or procedure? Send us a note and we&apos;ll respond shortly.
          </p>
        </div>
      </section>

      <div className="mx-auto px-6 md:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start" style={{ maxWidth: "var(--container)" }}>
        {/* Contact details */}
        <section aria-labelledby="reach-h">
          <h2 id="reach-h" className="eyebrow mb-6">Reach us</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-5">
            {DETAILS.map((d) => {
              const inner = (
                <div className="flex items-start gap-4">
                  <span className="flex-none flex items-center justify-center w-11 h-11 rounded-full text-plum" style={{ background: "var(--cream)" }}>
                    {d.icon}
                  </span>
                  <div>
                    <h3 className="font-sans text-[11px] tracking-[0.14em] uppercase text-gold-text mb-1">{d.label}</h3>
                    {d.lines.map((line) => (
                      <p key={line} className="font-sans text-plum-soft text-sm leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              );
              return (
                <li key={d.label} className="surface-card p-5">
                  {d.href ? (
                    <a href={d.href} className="no-underline block hover:opacity-80 transition-opacity">{inner}</a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-xl overflow-hidden h-56 md:h-72 flex items-center justify-center" style={{ background: "linear-gradient(150deg, var(--cream), var(--blush))" }} aria-hidden="true">
            <span className="font-serif italic text-[rgba(60,35,49,0.4)]">clinic location map</span>
          </div>
        </section>

        {/* Enquiry form */}
        <BookingFormCard
          services={["General enquiry"]}
          fixedService="General enquiry"
          heading="Send an enquiry"
          intro="Fill in your details and your message — we'll get back to you."
          submitLabel="Send message"
          successMessage="Thank you — your message has been received. We'll be in touch soon."
        />
      </div>
    </SiteShell>
  );
}
