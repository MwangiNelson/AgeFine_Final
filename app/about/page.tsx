import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "About — Agefine Cosmetics",
  description:
    "Agefine Cosmetics is a dermatologist-led skin and beauty clinic in Nairobi, pairing clinically considered skincare with expert in-clinic procedures.",
};

const VALUES = [
  { title: "Clinically led", body: "Every formulation and procedure is grounded in dermatological expertise — not trends." },
  { title: "Honest beauty", body: "Cruelty free, transparent ingredients, and care tailored to real skin." },
  { title: "Lasting results", body: "We build routines and treatment plans designed for healthy skin over time." },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20" style={{ maxWidth: "760px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--rose)" }}>Our story</p>
          <h1 className="section-title text-[42px] md:text-[60px] leading-[1.04]">
            Beauty that begins with <span className="italic text-rose">healthy skin.</span>
          </h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-6 max-w-[54ch]">
            Agefine Cosmetics is a dermatologist-led skin and beauty clinic in Nairobi. We pair
            clinically considered skincare with expert in-clinic procedures, so your glow comes
            from genuinely cared-for skin.
          </p>
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
