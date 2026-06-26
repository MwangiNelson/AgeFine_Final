import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import BookingFormCard from "@/components/BookingFormCard";
import { supabase } from "@/lib/supabaseClient";
import { SITE } from "@/lib/site";
import { excerpt } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Treatments & Procedures",
  description:
    `Aesthetic skin treatments at ${SITE.name}, Imaara Shopping Mall, Nairobi — chemical peels, microneedling, LED light therapy, HydraFacial, mesotherapy, IV nutrition and more. Book in-app with our calendar.`,
  alternates: { canonical: "/services" },
  openGraph: { title: `Treatments & Procedures — ${SITE.shortName}`, url: "/services" },
};

// Shown if the services table hasn't been seeded yet.
const FALLBACK_SERVICES = [
  { id: "hydrafacial", slug: "", name: "HydraFacial", category: "Facials & Glow", duration_min: 45, price_kes: null, image_url: null, description: "A deep cleanse, exfoliation and intense hydration for an instant, lasting glow." },
  { id: "chemical-peels", slug: "", name: "Chemical Peels", category: "Clinical Treatments", duration_min: 45, price_kes: null, image_url: null, description: "Resurface and brighten — targets dullness, uneven tone and fine texture." },
  { id: "microneedling", slug: "", name: "Microneedling", category: "Clinical Treatments", duration_min: 60, price_kes: null, image_url: null, description: "Stimulates collagen to refine texture, scars and overall firmness." },
  { id: "skin-consultation", slug: "", name: "Skin Consultation", category: "Consultation", duration_min: 30, price_kes: null, image_url: null, description: "A personalised assessment and treatment plan with our specialists." },
];

/** Render categories in a deliberate order; anything new lands at the end. */
const CATEGORY_ORDER = ["Facials & Glow", "Clinical Treatments", "Advanced Aesthetics", "Consultation"];

export default async function ServicesPage() {
  const { data } = await supabase
    .from("services")
    .select("id, slug, name, category, description, duration_min, price_kes, image_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const services = data && data.length > 0 ? data : FALLBACK_SERVICES;
  const serviceNames = services.map((s) => s.name);

  const categories = [...new Set(services.map((s) => s.category))].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20 text-center" style={{ maxWidth: "760px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--rose)" }}>{SITE.tagline}</p>
          <h1 className="section-title text-[42px] md:text-[60px] leading-[1.02]">
            Procedures, <span className="italic text-rose">perfected.</span>
          </h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-5 max-w-[48ch] mx-auto">
            Science-backed treatments by dermatology, nutrition and cosmetic experts at
            our Imaara Shopping Mall clinic. Pick a treatment, choose a time — we&rsquo;ll confirm.
          </p>
        </div>
      </section>

      {/* Services grid + booking */}
      <div className="mx-auto px-6 md:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start" style={{ maxWidth: "var(--container)" }}>
        {/* Services by category */}
        <div className="flex flex-col gap-12">
          {categories.map((cat) => (
            <section key={cat} aria-label={cat}>
              <h2 className="eyebrow mb-6">{cat}</h2>
              <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {services
                  .filter((s) => s.category === cat)
                  .map((s) => {
                    const card = (
                      <>
                        {s.image_url && (
                          <div
                            role="img"
                            aria-label={`${s.name} at ${SITE.shortName}`}
                            className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                            style={{ backgroundImage: `url(${s.image_url})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
                          />
                        )}
                        <div className="p-6 flex flex-col flex-1 bg-white relative">
                          <div className="flex items-baseline justify-between gap-3 mb-2">
                            <h3 className="font-serif text-plum text-xl md:text-2xl leading-tight m-0">{s.name}</h3>
                            <span className="font-sans text-[11px] tracking-[0.1em] uppercase text-gold-text whitespace-nowrap">{s.duration_min} min</span>
                          </div>
                          <p className="font-sans font-light text-plum-soft text-sm leading-relaxed flex-1 m-0">{excerpt(s.description)}</p>
                          <p className="font-sans text-plum tracking-[0.05em] text-[13px] mt-4 mb-0 flex items-center justify-between">
                            <span>{s.price_kes != null ? `KES ${s.price_kes.toLocaleString()}` : "Priced on consultation"}</span>
                            {s.slug && (
                              <span aria-hidden="true" className="text-gold-text text-[11px] tracking-[0.12em] uppercase">
                                Details →
                              </span>
                            )}
                          </p>
                        </div>
                      </>
                    );

                    return (
                      <li key={s.id} className="surface-card overflow-hidden flex flex-col group">
                        {s.slug ? (
                          <Link href={`/services/${s.slug}`} className="no-underline flex flex-col flex-1" aria-label={`${s.name} — details and gallery`}>
                            {card}
                          </Link>
                        ) : (
                          card
                        )}
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>

        {/* Booking form (sticky on desktop) */}
        <div className="lg:sticky lg:top-28">
          <BookingFormCard
            services={serviceNames}
            heading="Book a procedure"
            intro="Pick a date and time — we'll confirm by phone or WhatsApp."
            submitLabel="Request booking"
          />
        </div>
      </div>
    </SiteShell>
  );
}
