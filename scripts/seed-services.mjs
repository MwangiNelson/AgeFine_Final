// Seed the real Agefine service catalogue with the client's own photography.
//
// Content (names, taglines, descriptions, benefits) is distilled from the
// client's Instagram posts (@agefine_beauty); images in scripts/ig-images are
// their own post photos, re-hosted in the public `service-images` bucket so
// the app owns its assets. Idempotent: storage uploads upsert, services
// upsert by slug, and sample services not in this catalogue are removed.
//
// Prices are intentionally left null (shown as "on consultation") — the
// client sets real prices in /admin/services.
//
// Usage: node scripts/seed-services.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv(new URL("../.env", import.meta.url));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "service-images";

const SERVICES = [
  {
    slug: "chemical-peels",
    name: "Chemical Peels",
    category: "Clinical Treatments",
    tagline: "Your skin's reset button",
    description:
      "From gentle mandelic peels to medium-depth TCA and the carbon “Hollywood” peel — our peels dissolve dull, damaged layers to reveal a smooth, glass-like complexion. Formulas are chosen for your skin, with options that are safe for sensitive skin and deeper skin tones.",
    benefits: [
      "Clears acne and regulates oil",
      "Fades hyperpigmentation, sun damage and melasma",
      "Smooths uneven texture for a glass-like finish",
      "Options safe for sensitive and deeper skin tones",
    ],
    duration_min: 45,
    featured: true,
    gallery: 2,
  },
  {
    slug: "microneedling",
    name: "Microneedling & Microchanneling",
    category: "Clinical Treatments",
    tagline: "Collagen, naturally rebuilt",
    description:
      "Tiny, controlled micro-channels switch on your skin's natural healing response — boosting collagen and elastin while active serums penetrate deeper for better results. Includes ProCell Microchanneling and PRP options.",
    benefits: [
      "Softens acne scars and enlarged pores",
      "Firms fine lines and early signs of ageing",
      "Brightens dark marks and uneven tone",
      "Gradual, natural-looking results",
    ],
    duration_min: 60,
    featured: true,
    gallery: 2,
  },
  {
    slug: "led-light-therapy",
    name: "LED Light Therapy",
    category: "Clinical Treatments",
    tagline: "Heal, glow and renew — while you relax",
    description:
      "Targeted wavelengths treat your skin at a deeper level — non-invasive, painless and results-driven. Green light calms irritation and supports an even tone; red light boosts collagen for anti-ageing.",
    benefits: [
      "Calms active acne and kills bacteria",
      "Soothes inflammation and redness",
      "Boosts collagen and improves texture",
      "Non-invasive with zero downtime",
    ],
    duration_min: 30,
    featured: true,
    gallery: 1,
  },
  {
    slug: "hydrafacial",
    name: "HydraFacial",
    category: "Facials & Glow",
    tagline: "Clean. Smooth. Hydrated. Glowing.",
    description:
      "Deeply cleanses pores, gently exfoliates dead skin and floods your face with intense hydration — all in one treatment. Instant results with no downtime.",
    benefits: [
      "Clears congestion and impurities",
      "Smooths texture and boosts radiance",
      "Plump, fresh, glowing skin",
      "No downtime — instant results",
    ],
    duration_min: 45,
    featured: true,
    gallery: 0,
  },
  {
    slug: "signature-facials",
    name: "Signature Facials",
    category: "Facials & Glow",
    tagline: "Treat. Resolve. Maintain.",
    description:
      "Medical-grade facials tailored to your skin — from the collagen-boosting Peptide Facial to Kalahari Vitamin C and Rooibos antioxidant infusions and carboxy therapy masks. Your skin works hard 24/7; it deserves a monthly reset.",
    benefits: [
      "Tailored to your skin's needs",
      "Medical-grade actives and masks",
      "Deep cleanse, decongest and hydrate",
      "Repairs and strengthens the skin barrier",
    ],
    duration_min: 60,
    featured: true,
    gallery: 3,
  },
  {
    slug: "mesotherapy-skin-boosters",
    name: "Mesotherapy & Skin Boosters",
    category: "Advanced Aesthetics",
    tagline: "Radiance from beneath the surface",
    description:
      "Our Radiance Renewal Infusion delivers powerful brightening and repair ingredients deep into the skin using transdermal mesotherapy, alongside Korean hyaluronic-acid skin boosters for deep, lasting hydration.",
    benefits: [
      "Brighter, even-toned skin",
      "Reduces stubborn pigmentation",
      "Deep, lasting hydration and glow",
      "Smoother, healthier texture",
    ],
    duration_min: 45,
    featured: false,
    gallery: 0,
  },
  {
    slug: "iv-nutrition-therapy",
    name: "IV Nutrition Therapy",
    category: "Advanced Aesthetics",
    tagline: "Feed your glow from within",
    description:
      "A potent blend of vitamins, minerals, antioxidants and amino acids delivered directly into your bloodstream for maximum absorption — supercharging your glow while nourishing immunity, energy and metabolism.",
    benefits: [
      "Maximum absorption, immediate revitalisation",
      "Fights visible signs of ageing",
      "Supports immunity and energy",
      "Beauty that starts at a cellular level",
    ],
    duration_min: 45,
    featured: false,
    gallery: 0,
  },
  {
    slug: "injectables-prp",
    name: "Injectables, PRP & Bio-Remodelling",
    category: "Advanced Aesthetics",
    tagline: "Natural-looking, professional results",
    description:
      "Anti-wrinkle injections, dermal fillers, bio-stimulators and Face PRP — administered by trained professionals for results that enhance your natural beauty. You'll still look like you, only fresher.",
    benefits: [
      "Administered by trained professionals",
      "Softens lines and restores volume",
      "PRP uses your own plasma to boost collagen",
      "No surgery, minimal downtime",
    ],
    duration_min: 45,
    featured: false,
    gallery: 0,
  },
  {
    slug: "skin-tightening-contouring",
    name: "Skin Tightening & Contouring",
    category: "Advanced Aesthetics",
    tagline: "Sculpt, define & reveal your best features",
    description:
      "HIFU, radio-frequency skin tightening, fat-dissolving injections and lymphatic drainage massage — precision treatments that lift, firm and define without surgery.",
    benefits: [
      "Lifts and tightens sagging skin",
      "Defines facial contours",
      "Stimulates deep collagen renewal",
      "Non-surgical, no downtime",
    ],
    duration_min: 60,
    featured: false,
    gallery: 2,
  },
  {
    slug: "bridal-glow-package",
    name: "Bridal Glow Package",
    category: "Facials & Glow",
    tagline: "Glow down the aisle",
    description:
      "Pre-wedding skin prep that transforms your skin in the weeks before you say “I do” — medical-grade facials, brightening peels and a bespoke treatment plan timed to your big day.",
    benefits: [
      "Bespoke plan timed to your wedding",
      "Medical-grade facials and peels",
      "Luminous, photo-ready skin",
      "Bridal party options available",
    ],
    duration_min: 90,
    featured: false,
    gallery: 0,
  },
  {
    slug: "skin-consultation",
    name: "Skin Consultation & Analysis",
    category: "Consultation",
    tagline: "Every treatment starts before the treatment",
    description:
      "A personalised assessment with our dermatology, nutrition and cosmetic experts. We listen, analyse your skin and build a treatment plan that targets the root cause — not just the symptoms.",
    benefits: [
      "Expert skin analysis",
      "Personalised treatment plan",
      "Dermatology and nutrition perspective",
      "Honest, science-backed guidance",
    ],
    duration_min: 30,
    featured: false,
    gallery: 1,
  },
];

// Site-wide brand imagery (about page, careers page) — uploaded alongside.
const SITE_IMAGES = ["site-about-clinic.jpg", "site-careers-training.jpg"];

async function upload(file) {
  const body = readFileSync(new URL(`./ig-images/${file}`, import.meta.url));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(file, body, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`upload ${file}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(file).data.publicUrl;
}

let sort = 0;
const keepSlugs = SERVICES.map((s) => s.slug);

for (const svc of SERVICES) {
  const image_url = await upload(`${svc.slug}.jpg`);
  const gallery_urls = [];
  for (let i = 2; i < svc.gallery + 2; i++) {
    gallery_urls.push(await upload(`${svc.slug}-${i}.jpg`));
  }

  const row = {
    slug: svc.slug,
    name: svc.name,
    category: svc.category,
    tagline: svc.tagline,
    description: svc.description,
    benefits: svc.benefits,
    duration_min: svc.duration_min,
    price_kes: null,
    image_url,
    gallery_urls,
    featured: svc.featured,
    sort_order: (sort += 10),
    active: true,
  };
  const { error } = await supabase.from("services").upsert(row, { onConflict: "slug" });
  if (error) throw new Error(`upsert ${svc.slug}: ${error.message}`);
  console.log(`✓ ${svc.name} (${1 + gallery_urls.length} image${gallery_urls.length ? "s" : ""})`);
}

for (const file of SITE_IMAGES) {
  console.log(`✓ ${await upload(file)}`);
}

// Remove the placeholder sample services that aren't part of the real catalogue.
const { data: removed, error: delError } = await supabase
  .from("services")
  .delete()
  .not("slug", "in", `(${keepSlugs.join(",")})`)
  .select("slug");
if (delError) throw new Error(`cleanup: ${delError.message}`);
if (removed?.length) console.log(`− removed sample services: ${removed.map((r) => r.slug).join(", ")}`);

console.log("Done.");
