import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    `${SITE.name} is an aesthetics lab and clinic at Imaara Mall, Nairobi — anti-ageing and aesthetic skin solutions by dermatology, nutrition and cosmetic experts, plus TVET-approved aesthetics training.`,
  alternates: { canonical: "/about" },
  openGraph: { title: `About — ${SITE.shortName}`, url: "/about" },
};

const VALUES = [
  { title: "Science first", body: "Where science speaks, aesthetics listens — every treatment is grounded in dermatology, nutrition and cosmetic science, not trends." },
  { title: "Treat the root cause", body: "We listen, assess and correct what's actually driving your skin concerns — not just mask the symptoms." },
  { title: "Treat · Resolve · Maintain", body: "Real results compound. We build treatment plans designed for healthy, radiant skin over time." },
];

const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-images`;

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20" style={{ maxWidth: "760px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--rose)" }}>Our story</p>
          <h1 className="section-title text-[42px] md:text-[60px] leading-[1.04]">
            Where science speaks, <span className="italic text-rose">aesthetics listens.</span>
          </h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-6 max-w-[54ch]">
            {SITE.name} is an aesthetics lab and clinic on the 2nd floor of Imaara Mall,
            Mombasa Road, Nairobi. Our dermatology, nutrition and cosmetic experts pair
            science-backed treatments — peels, microneedling, LED therapy, mesotherapy and
            more — with honest guidance, so your glow comes from genuinely healthy skin.
          </p>
        </div>
      </section>

      {/* The clinic, in their own photography */}
      <section aria-label="Inside the clinic" className="mx-auto px-6 md:px-8 pt-14 md:pt-20" style={{ maxWidth: "var(--container)" }}>
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <div
            role="img"
            aria-label="An Agefine aesthetician performing a precision treatment"
            className="rounded-xl overflow-hidden aspect-[4/3]"
            style={{ backgroundImage: `url(${STORAGE}/skin-consultation.jpg)`, backgroundSize: "cover", backgroundPosition: "center 25%" }}
          />
          <div
            role="img"
            aria-label="Agefine team member preparing a facial treatment in the clinic"
            className="rounded-xl overflow-hidden aspect-[4/3]"
            style={{ backgroundImage: `url(${STORAGE}/skin-consultation-2.jpg)`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
          />
        </div>
      </section>

      <section aria-label="Our values" className="mx-auto px-6 md:px-8 py-14 md:py-24" style={{ maxWidth: "var(--container)" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {VALUES.map((v) => (
            <div key={v.title} className="surface-card p-7 md:p-8">
              <h2 className="font-serif text-plum text-2xl mb-3">{v.title}</h2>
              <p className="font-sans font-light text-plum-soft text-[15px] leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Training arm */}
      <section aria-labelledby="training-about-h" className="bg-sand">
        <div className="mx-auto px-6 md:px-8 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center" style={{ maxWidth: "var(--container)" }}>
          <div>
            <p className="eyebrow mb-3" style={{ color: "var(--rose)" }}>More than a clinic</p>
            <h2 id="training-about-h" className="section-title text-[30px] md:text-[40px] mb-4">We also teach aesthetics</h2>
            <p className="font-sans font-light text-plum-soft text-[15px] leading-[1.8] max-w-[52ch]">
              Through Agefine Aesthetics Training we run TVET-approved courses in aesthetics
              science and science-backed skincare — practical skills, taught inside a working
              clinic, with certification employers trust.
            </p>
            <Link href="/careers" className="btn btn-primary mt-6">Careers &amp; training</Link>
          </div>
          <div
            role="img"
            aria-label="Aesthetics training session at Agefine"
            className="rounded-xl overflow-hidden aspect-[4/3]"
            style={{ backgroundImage: `url(${STORAGE}/site-careers-training.jpg)`, backgroundSize: "cover", backgroundPosition: "center 25%" }}
          />
        </div>
      </section>

      <section className="bg-plum text-ivory">
        <div className="mx-auto px-6 md:px-8 py-16 md:py-24 text-center" style={{ maxWidth: "620px" }}>
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>Visit the clinic</p>
          <h2 className="font-serif font-medium text-ivory text-[32px] md:text-[44px] mt-4 mb-5">
            Start your skin journey
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/services" className="btn btn-gold">Book a consultation</Link>
            <Link href="/shop" className="btn btn-outline" style={{ color: "var(--ivory)", borderColor: "var(--gold-soft)" }}>Shop skincare</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
