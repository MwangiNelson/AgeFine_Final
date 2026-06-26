import SiteShell from "@/components/SiteShell";
import Reveal from "@/components/Reveal";
import ApplicationFormCard from "@/components/ApplicationFormCard";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Careers & Training",
  description:
    `Work at ${SITE.name} or train in aesthetics science — TVET-approved courses with practical skills, science-backed techniques and industry certification. Admissions ongoing at Imaara Shopping Mall, Nairobi.`,
  alternates: { canonical: "/careers" },
  openGraph: { title: `Careers & Training — ${SITE.shortName}`, url: "/careers" },
};

const TRAINING_POINTS = [
  "Learn from practising aesthetics experts",
  "Master science-based techniques",
  "TVET-approved certification employers trust",
  "Beginner, advanced and specialised modules",
];

const TEAM_POINTS = [
  "Work with medical-grade equipment and brands",
  "A busy, growing clinic on Mombasa Road",
  "Continuous training and mentorship",
  "A team that treats clients like family",
];

const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-images`;
const TRAINING_IMAGE = `${STORAGE}/site-careers-training.jpg`;
const CLINIC_IMAGE = `${STORAGE}/skin-consultation.jpg`;

export default function CareersPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-cream border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-14 md:pb-20 text-center" style={{ maxWidth: "760px" }}>
          <p className="eyebrow mb-4" style={{ color: "var(--brand-pink-deep)" }}>Careers &amp; training · Admissions ongoing</p>
          <h1 className="section-title text-[42px] md:text-[60px] leading-[1.02]">
            Build a career in <span className="italic text-brand-pink-deep">aesthetics.</span>
          </h1>
          <p className="font-sans font-light text-plum-soft text-[15px] md:text-lg leading-relaxed mt-5 max-w-[52ch] mx-auto">
            Join the {SITE.shortName} team — or study aesthetics science with us and earn
            certification that sets you apart as a qualified skincare professional.
          </p>
        </div>
      </section>

      {/* Two tracks */}
      <div className="mx-auto px-6 md:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start" style={{ maxWidth: "var(--container)" }}>
        <div className="flex flex-col gap-14">
          {/* Train with us */}
          <Reveal as="section" aria-labelledby="training-h">
            <div
              role="img"
              aria-label="Aesthetics training at Agefine — students practising treatments in the clinic"
              className="rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] mb-7"
              style={{ backgroundImage: `url(${TRAINING_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center 25%" }}
            />
            <h2 id="training-h" className="section-title text-[28px] md:text-[36px] mb-3">
              <span className="eyebrow block mb-2" style={{ color: "var(--brand-blue)" }}>Agefine Aesthetics Training</span>
              Study aesthetics science
            </h2>
            <p className="font-sans font-light text-plum-soft text-[15px] md:text-base leading-[1.8] max-w-[62ch]">
              We offer TVET-approved training in aesthetics science and science-backed
              skincare. Our comprehensive courses are designed to equip you with practical
              skills, scientific knowledge and industry certification — taught hands-on,
              inside a working clinic.
            </p>
            <ul className="list-none p-0 m-0 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAINING_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 font-sans font-light text-plum text-[14.5px] leading-relaxed">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="1.6" className="mt-0.5 shrink-0">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Join the team */}
          <Reveal as="section" aria-labelledby="team-h">
            <div
              role="img"
              aria-label="An Agefine aesthetician performing a treatment at the Imaara Shopping Mall clinic"
              className="rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] mb-7"
              style={{ backgroundImage: `url(${CLINIC_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
            />
            <h2 id="team-h" className="section-title text-[28px] md:text-[36px] mb-3">
              <span className="eyebrow block mb-2" style={{ color: "var(--brand-pink-deep)" }}>Work with us</span>
              Join the {SITE.shortName} team
            </h2>
            <p className="font-sans font-light text-plum-soft text-[15px] md:text-base leading-[1.8] max-w-[62ch]">
              We&rsquo;re always looking for aestheticians, beauty therapists and
              front-of-house stars who care about results and client experience. Tell us
              what you do best — when a position opens, you&rsquo;ll be the first to know.
            </p>
            <ul className="list-none p-0 m-0 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEAM_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 font-sans font-light text-plum text-[14.5px] leading-relaxed">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-pink)" strokeWidth="1.6" className="mt-0.5 shrink-0">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Application form (sticky on desktop) */}
        <div className="lg:sticky lg:top-28">
          <ApplicationFormCard defaultInterest="training" />
        </div>
      </div>
    </SiteShell>
  );
}
