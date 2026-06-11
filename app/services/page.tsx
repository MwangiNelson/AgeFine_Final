import SiteShell from "@/components/SiteShell";
import BookingFormCard from "@/components/BookingFormCard";

export const metadata = {
  title: "Services & Procedures",
  description:
    "Expert in-clinic beauty procedures at Agefine Cosmetics, Nairobi. Book a HydraFacial, chemical peel, microneedling and more with our dermatologist-led team.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Services & Procedures — Agefine Cosmetics", url: "/services" },
};

const SERVICES = [
  { name: "HydraFacial", duration: "45 min", description: "A deep cleanse, exfoliation and intense hydration for an instant, lasting glow." },
  { name: "Chemical peel", duration: "30 min", description: "Resurface and brighten — targets dullness, uneven tone and fine texture." },
  { name: "Microneedling", duration: "60 min", description: "Stimulates collagen to refine texture, scars and overall firmness." },
  { name: "Skin consultation", duration: "30 min", description: "A personalised assessment and treatment plan with our specialists." },
  { name: "LED light therapy", duration: "30 min", description: "Calms, clears and rejuvenates using clinical-grade light wavelengths." },
  { name: "Dermaplaning", duration: "40 min", description: "Gentle physical exfoliation for smooth, radiant, makeup-ready skin." },
];

const SERVICE_NAMES = SERVICES.map((s) => s.name);

export default function ServicesPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20 text-center" style={{ maxWidth: "760px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--rose)" }}>In-clinic care</p>
          <h1 className="section-title text-[42px] md:text-[60px] leading-[1.02]">
            Procedures, <span className="italic text-rose">perfected.</span>
          </h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-5 max-w-[48ch] mx-auto">
            Dermatologist-led treatments tailored to your skin. Book a consultation and let
            our specialists craft your plan.
          </p>
        </div>
      </section>

      {/* Services grid + booking */}
      <div className="mx-auto px-6 md:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start" style={{ maxWidth: "var(--container)" }}>
        {/* Services list */}
        <section aria-labelledby="services-h">
          <h2 id="services-h" className="eyebrow mb-6">Our treatments</h2>
          <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SERVICES.map((s) => (
              <li key={s.name} className="surface-card p-6 flex flex-col">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="font-serif text-plum text-xl md:text-2xl leading-tight">{s.name}</h3>
                  <span className="font-sans text-[11px] tracking-[0.1em] uppercase text-gold-text whitespace-nowrap">{s.duration}</span>
                </div>
                <p className="font-sans font-light text-plum-soft text-sm leading-relaxed">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Booking form (sticky on desktop) */}
        <div className="lg:sticky lg:top-28">
          <BookingFormCard
            services={SERVICE_NAMES}
            heading="Book a procedure"
            intro="Request a time and we'll confirm by phone or WhatsApp."
            submitLabel="Request booking"
          />
        </div>
      </div>
    </SiteShell>
  );
}
