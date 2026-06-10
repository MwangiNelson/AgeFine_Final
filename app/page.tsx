import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Reveal from "@/components/Reveal";
import ProductGridCard from "@/components/ProductGridCard";
import ProcedureItem from "@/components/ProcedureItem";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const PROCEDURES = [
  { name: "HydraFacial", description: "Deep cleanse & hydrate · 45 min" },
  { name: "Chemical peel", description: "Resurface & brighten · 30 min" },
  { name: "Microneedling", description: "Texture & firmness · 60 min" },
];

const PROMISES = ["Cruelty free", "Dermatologist led", "Nairobi clinic"];

export default async function Home() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const bestsellers = products ?? [];

  return (
    <SiteShell>
      {/* ===== Hero ===== */}
      <section
        aria-labelledby="hero-h"
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 82% 6%, rgba(216,189,140,.28), transparent 55%), linear-gradient(168deg, var(--ivory) 0%, var(--cream) 46%, var(--blush) 130%)",
        }}
      >
        {/* Decorative rings */}
        <div aria-hidden="true" className="pointer-events-none absolute rounded-full border opacity-70 w-[230px] h-[230px] md:w-[420px] md:h-[420px] -top-16 -right-20 md:top-10 md:-right-24" style={{ borderColor: "var(--gold-soft)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute rounded-full w-[150px] h-[150px] md:w-[230px] md:h-[230px] top-8 right-5 md:top-28 md:right-24" style={{ background: "radial-gradient(circle at 35% 30%, #fff, var(--blush) 70%, var(--blush-deep))" }} />

        <div className="mx-auto px-6 md:px-8 py-14 md:py-28 grid grid-cols-1 md:grid-cols-2 items-center gap-12" style={{ maxWidth: "var(--container)" }}>
          <div className="relative z-10">
            <p className="eyebrow mb-4 md:mb-6">Skin · beauty · confidence</p>
            <h1 id="hero-h" className="font-serif font-medium text-plum leading-[1.02] tracking-[0.5px] text-[clamp(2.9rem,7vw,4.6rem)] max-w-[10ch]">
              Radiance, <span className="italic text-rose">refined.</span>
            </h1>
            <p className="font-sans font-light text-plum-soft leading-[1.7] text-[15px] md:text-base mt-5 md:mt-7 mb-7 md:mb-9 max-w-[40ch]">
              Clinically considered skincare and expert procedures, crafted for your
              natural glow — shop online or book a treatment at our Nairobi clinic.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">Shop the collection</Link>
              <Link href="/services" className="btn btn-outline">Book a procedure</Link>
            </div>
          </div>

          {/* Desktop hero visual */}
          <div aria-hidden="true" className="relative hidden md:block h-[440px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(150deg,#F3E0DE,#D7A9A2)", boxShadow: "0 30px 70px rgba(60,35,49,0.18)" }}>
              <span className="absolute inset-0 flex items-center justify-center font-serif italic text-[rgba(60,35,49,0.32)] text-lg">
                campaign imagery
              </span>
            </div>
          </div>
        </div>
      </section>

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

      {/* ===== Signature procedures ===== */}
      <section aria-labelledby="procedures-h" className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-4" style={{ maxWidth: "var(--container)" }}>
        <Reveal>
          <h2 id="procedures-h" className="section-title text-[30px] md:text-[42px] mb-7 md:mb-10">
            <span className="eyebrow block mb-2" style={{ color: "var(--rose)" }}>In-clinic</span>
            Signature procedures
          </h2>
        </Reveal>
        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
          {PROCEDURES.map((proc) => (
            <ProcedureItem key={proc.name} procedure={proc} />
          ))}
        </Reveal>
      </section>

      {/* ===== Founder quote ===== */}
      <Reveal as="section" aria-label="Founder note" className="bg-sand mt-16 md:mt-24">
        <div className="mx-auto px-6 md:px-8 py-16 md:py-28 text-center" style={{ maxWidth: "760px" }}>
          <p className="font-serif italic text-plum leading-[1.32] text-[26px] md:text-[40px]">
            &ldquo;Beauty that begins with healthy, cared-for skin.&rdquo;
          </p>
          <p className="eyebrow mt-6" style={{ color: "var(--rose)" }}>— Mama Mungwana, founder</p>
        </div>
      </Reveal>

      {/* ===== Booking CTA ===== */}
      <Reveal as="section" aria-labelledby="booking-h" className="bg-plum text-ivory">
        <div className="mx-auto px-6 md:px-8 py-16 md:py-28 text-center" style={{ maxWidth: "640px" }}>
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>Visit us</p>
          <h2 id="booking-h" className="font-serif font-medium text-ivory leading-[1.08] text-[34px] md:text-[48px] mt-4 mb-4">
            Book your consultation
          </h2>
          <p className="font-sans font-light text-[13px] md:text-[15px] leading-[1.7] max-w-[36ch] mx-auto mb-8" style={{ color: "#E9D9D2" }}>
            Personalised skin assessments with our specialists. Walk in radiant.
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
