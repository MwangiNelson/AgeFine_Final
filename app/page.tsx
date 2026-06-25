import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Reveal from "@/components/Reveal";
import ProductGridCard from "@/components/ProductGridCard";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import FindUs from "@/components/FindUs";
import { supabase } from "@/lib/supabaseClient";
import { SITE } from "@/lib/site";
import { excerpt } from "@/lib/admin";

export const dynamic = "force-dynamic";

const PROMISES = ["Science-backed treatments", "Dermatology · Nutrition · Cosmetic experts", "Imaara Mall, Mombasa Road"];

export default async function Home() {
  const [{ data: products }, { data: featured }, { data: services }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(4),
    supabase
      .from("services")
      .select("slug, name, description, image_url")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(5),
    supabase
      .from("services")
      .select("slug, name, duration_min, price_kes, image_url, category")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);

  // Prefer the admin-curated featured set; fall back to the newest products
  // so the homepage is never empty before anything is featured.
  let bestsellers = products ?? [];
  if (bestsellers.length === 0) {
    const { data: recent } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    bestsellers = recent ?? [];
  }
  const slides: HeroSlide[] = (featured ?? [])
    .filter((s) => s.image_url)
    .map((s) => ({ slug: s.slug, name: s.name, tagline: excerpt(s.description, 90) || null, image: s.image_url! }));
  const allServices = services ?? [];
  const treatments = allServices.filter((s) => !slides.some((f) => f.slug === s.slug)).slice(0, 6);

  return (
    <SiteShell>
      {/* SEO h1 precedes the carousel's per-slide h2s to keep heading order valid */}
      {slides.length > 0 && (
        <h1 className="sr-only">
          {SITE.name} — aesthetic skin treatments, beauty procedures and skincare in Nairobi
        </h1>
      )}

      {/* ===== Hero: signature procedures carousel ===== */}
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section aria-labelledby="hero-h" className="bg-cream">
          <div className="mx-auto px-6 md:px-8 py-20 md:py-28 text-center" style={{ maxWidth: "760px" }}>
            <p className="eyebrow mb-4">{SITE.tagline}</p>
            <h1 id="hero-h" className="section-title text-[42px] md:text-[60px]">
              Radiance, <span className="italic text-rose">refined.</span>
            </h1>
            <Link href="/services" className="btn btn-primary mt-8">Book a procedure</Link>
          </div>
        </section>
      )}

      {/* ===== Promise strip ===== */}
      <section aria-label="Why Agefine" className="bg-ivory border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 py-5 md:py-7 flex justify-around md:justify-center md:gap-20" style={{ maxWidth: "var(--container)" }}>
          {PROMISES.map((t) => (
            <div key={t} className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 text-plum-soft text-[9.5px] md:text-[11px] tracking-[0.14em] uppercase text-center font-sans">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.3">
                <path d="M12 21s-7-4.6-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.4-9 9-9 9z" />
              </svg>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* ===== More treatments ===== */}
      <section aria-labelledby="treatments-h" className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-4" style={{ maxWidth: "var(--container)" }}>
        <Reveal className="flex items-end justify-between mb-7 md:mb-10">
          <h2 id="treatments-h" className="section-title text-[30px] md:text-[42px]">
            <span className="eyebrow block mb-2" style={{ color: "var(--rose)" }}>In-clinic</span>
            The treatment menu
          </h2>
          <Link href="/services" className="font-sans text-[11px] md:text-xs tracking-[0.12em] uppercase text-gold-text no-underline whitespace-nowrap border-b pb-0.5 hover:text-plum transition-colors" style={{ borderColor: "var(--gold-soft)" }}>
            View all
          </Link>
        </Reveal>

        <Reveal className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {treatments.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group relative rounded-xl overflow-hidden no-underline aspect-[4/5] sm:aspect-[4/4.4] flex"
              style={{ background: "var(--sand)" }}
            >
              {s.image_url && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${s.image_url})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(43,27,36,0.78), rgba(43,27,36,0.06) 55%)" }}
              />
              <span className="relative mt-auto p-4 md:p-5">
                <span className="block font-serif text-[18px] md:text-[22px] leading-snug" style={{ color: "var(--ivory)" }}>
                  {s.name}
                </span>
                <span className="block font-sans text-[10.5px] tracking-[0.14em] uppercase mt-1.5" style={{ color: "var(--gold-soft)" }}>
                  {s.duration_min} min{s.price_kes != null ? ` · KES ${s.price_kes.toLocaleString()}` : ""}
                </span>
              </span>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ===== Bestsellers ===== */}
      <section aria-labelledby="bestsellers-h" className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-4" style={{ maxWidth: "var(--container)" }}>
        <Reveal className="flex items-end justify-between mb-7 md:mb-10">
          <h2 id="bestsellers-h" className="section-title text-[30px] md:text-[42px]">
            <span className="eyebrow block mb-2" style={{ color: "var(--rose)" }}>Loved by clients</span>
            Bestsellers
          </h2>
          <Link href="/shop" className="font-sans text-[11px] md:text-xs tracking-[0.12em] uppercase text-gold-text no-underline whitespace-nowrap border-b pb-0.5 hover:text-plum transition-colors" style={{ borderColor: "var(--gold-soft)" }}>
            View all
          </Link>
        </Reveal>

        {bestsellers.length > 0 ? (
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9 md:gap-x-7 md:gap-y-12">
            {bestsellers.map((p, i) => (
              <ProductGridCard key={p.id} product={p} index={i} />
            ))}
          </Reveal>
        ) : (
          <p className="font-sans text-plum-soft text-sm py-6">
            Our collection is being prepared. Check back soon.
          </p>
        )}
      </section>

      {/* ===== Brand philosophy ===== */}
      <Reveal as="section" aria-label="Our philosophy" className="bg-sand mt-16 md:mt-24">
        <div className="mx-auto px-6 md:px-8 py-16 md:py-28 text-center" style={{ maxWidth: "760px" }}>
          <p className="font-serif italic text-plum leading-[1.32] text-[26px] md:text-[40px]">
            &ldquo;{SITE.tagline}.&rdquo;
          </p>
          <p className="eyebrow mt-6" style={{ color: "var(--rose)" }}>— {SITE.motto}</p>
        </div>
      </Reveal>

      {/* ===== Find us ===== */}
      <Reveal as="section" aria-labelledby="findus-h" className="mx-auto px-6 md:px-8 py-16 md:py-24" style={{ maxWidth: "var(--container)" }}>
        <h2 id="findus-h" className="section-title text-[30px] md:text-[42px] mb-8 md:mb-10">
          <span className="eyebrow block mb-2" style={{ color: "var(--rose)" }}>On Mombasa Road</span>
          Easy to find, easy to book
        </h2>
        <FindUs />
      </Reveal>

      {/* ===== Booking CTA ===== */}
      <Reveal as="section" aria-labelledby="booking-h" className="bg-plum text-ivory">
        <div className="mx-auto px-6 md:px-8 py-16 md:py-28 text-center" style={{ maxWidth: "640px" }}>
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>Visit us</p>
          <h2 id="booking-h" className="font-serif font-medium text-ivory leading-[1.08] text-[34px] md:text-[48px] mt-4 mb-4">
            Book your consultation
          </h2>
          <p className="font-sans font-light text-[13px] md:text-[15px] leading-[1.7] max-w-[36ch] mx-auto mb-8" style={{ color: "#E9D9D2" }}>
            Personalised skin assessments with our dermatology, nutrition and cosmetic
            experts. Walk in radiant.
          </p>
          <Link href="/services" className="btn btn-gold">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" />
            </svg>
            Book a procedure
          </Link>
        </div>
      </Reveal>
    </SiteShell>
  );
}
