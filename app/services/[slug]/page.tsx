import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import BookingFormCard from "@/components/BookingFormCard";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabaseClient";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getService(slug: string) {
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Treatment not found" };
  const description =
    service.description ?? `${service.name} at ${SITE.name}, Imaara Mall, Nairobi.`;
  return {
    title: `${service.name} — Treatments`,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — ${SITE.shortName}`,
      description,
      url: `/services/${service.slug}`,
      ...(service.image_url ? { images: [{ url: service.image_url }] } : {}),
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const gallery: string[] = service.gallery_urls ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description ?? undefined,
    image: service.image_url ?? undefined,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@type": "BeautySalon", name: SITE.name, url: SITE.url },
    areaServed: "Nairobi",
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-plum">
        {service.image_url && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundImage: `url(${service.image_url})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(43,27,36,0.85), rgba(43,27,36,0.25) 60%, rgba(43,27,36,0.35))" }}
        />
        <div className="relative mx-auto px-6 md:px-8 pt-28 md:pt-44 pb-12 md:pb-16" style={{ maxWidth: "var(--container)" }}>
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link href="/services" className="font-sans text-[11px] tracking-[0.14em] uppercase no-underline" style={{ color: "var(--gold-soft)" }}>
              ← All treatments
            </Link>
          </nav>
          <p className="eyebrow mb-3" style={{ color: "var(--gold-soft)" }}>{service.category}</p>
          <h1 className="font-serif font-medium leading-[1.04] text-[clamp(2.3rem,6.5vw,3.8rem)] m-0 max-w-[18ch]" style={{ color: "var(--ivory)" }}>
            {service.name}
          </h1>
          {service.tagline && (
            <p className="font-sans font-light text-[15px] md:text-lg mt-3 mb-0" style={{ color: "#EFDFD8" }}>
              {service.tagline}
            </p>
          )}
          <p className="font-sans text-[11.5px] tracking-[0.14em] uppercase mt-5 mb-0" style={{ color: "var(--gold-soft)" }}>
            {service.duration_min} min · {service.price_kes != null ? `KES ${service.price_kes.toLocaleString()}` : "Priced on consultation"}
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto px-6 md:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start" style={{ maxWidth: "var(--container)" }}>
        <div>
          <Reveal as="section" aria-labelledby="about-h">
            <h2 id="about-h" className="eyebrow mb-4">About this treatment</h2>
            <p className="font-sans font-light text-plum-soft text-[15.5px] md:text-[17px] leading-[1.8] m-0 max-w-[62ch]">
              {service.description}
            </p>
          </Reveal>

          {service.benefits.length > 0 && (
            <Reveal as="section" aria-labelledby="benefits-h" className="mt-10">
              <h2 id="benefits-h" className="eyebrow mb-5">What it helps with</h2>
              <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.benefits.map((b: string) => (
                  <li key={b} className="flex items-start gap-3 font-sans font-light text-plum text-[14.5px] leading-relaxed">
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" className="mt-0.5 shrink-0">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {gallery.length > 0 && (
            <Reveal as="section" aria-labelledby="gallery-h" className="mt-10">
              <h2 id="gallery-h" className="eyebrow mb-5">In the treatment room</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {gallery.map((url, i) => (
                  <div
                    key={url}
                    role="img"
                    aria-label={`${service.name} at ${SITE.shortName} — photo ${i + 1}`}
                    className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2 aspect-[4/4.2] md:aspect-auto" : "aspect-[4/5]"}`}
                    style={{ backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
                  />
                ))}
              </div>
              <p className="font-sans text-[12px] text-plum-soft mt-3 mb-0">
                Real treatments at our Imaara Mall clinic — more on{" "}
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gold-text">
                  Instagram @agefine_beauty
                </a>
                .
              </p>
            </Reveal>
          )}
        </div>

        {/* Booking (pre-selected to this treatment) */}
        <div className="lg:sticky lg:top-28">
          <BookingFormCard
            services={[service.name]}
            fixedService={service.name}
            heading={`Book ${service.name}`}
            intro="Pick a date and time — we'll confirm by phone or WhatsApp."
            submitLabel="Request booking"
          />
        </div>
      </div>
    </SiteShell>
  );
}
