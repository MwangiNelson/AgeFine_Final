// Seed: categories, products and services with images.
// Images are sourced from Unsplash (free + Unsplash+ via search), downloaded
// once and re-hosted in the public `product-images` storage bucket so the app
// owns its assets. Idempotent: upserts by slug, storage uploads use upsert.
// Usage: node scripts/seed.mjs
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

const BUCKET = "product-images";

// key → Unsplash base URL (sized at download time)
const IMAGES = {
  "vitamin-c-glow-serum":           "https://plus.unsplash.com/premium_photo-1661693591879-fbdd89fad6cd",
  "overnight-recovery-serum":       "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c",
  "hyaluronic-hydra-boost-serum":   "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
  "niacinamide-10-zinc-serum":      "https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f",
  "retinol-renewal-night-serum":    "https://plus.unsplash.com/premium_photo-1674739375749-7efe56fc8bbb",
  "hydra-repair-moisturiser":       "https://plus.unsplash.com/premium_photo-1679046948896-5f9aa56900e9",
  "ceramide-barrier-cream":         "https://images.unsplash.com/photo-1619451334792-150fd785ee74",
  "shea-velvet-night-cream":        "https://images.unsplash.com/photo-1609097164502-59a1f0f9a66f",
  "oil-free-gel-moisturiser":       "https://images.unsplash.com/photo-1672763057474-cce3af40cf4f",
  "gentle-renewal-cleanser":        "https://images.unsplash.com/photo-1597931752949-98c74b5b159f",
  "foaming-tea-tree-cleanser":      "https://images.unsplash.com/photo-1771309224199-ca868f4a772b",
  "creamy-oat-milk-cleanser":       "https://images.unsplash.com/photo-1623143445418-40c192fa3d11",
  "micellar-cleansing-water":       "https://images.unsplash.com/photo-1616118132534-381148898bb4",
  "rose-clay-clarifying-mask":      "https://plus.unsplash.com/premium_photo-1721000444995-5c7ea83111b4",
  "charcoal-detox-mask":            "https://plus.unsplash.com/premium_photo-1715889658882-919643b4266e",
  "honey-turmeric-glow-mask":       "https://images.unsplash.com/photo-1619153709644-6d147b198fdb",
  "overnight-sleeping-mask":        "https://images.unsplash.com/photo-1619153708291-c6e173ab572b",
  "daily-defence-sunscreen-spf-50": "https://images.unsplash.com/photo-1597317628840-d3472f7aa7fc",
  "tinted-mineral-sunscreen-spf-40":"https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a",
  "sun-stick-spf-50":               "https://plus.unsplash.com/premium_photo-1682535210542-21dceae4530c",
  "rose-water-toning-mist":         "https://plus.unsplash.com/premium_photo-1661455809407-4ed9162db4f8",
  "glycolic-radiance-toner":        "https://images.unsplash.com/photo-1670201202788-522ad9d46a9b",
  "caffeine-bright-eye-cream":      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
  "shea-lip-repair-balm":           "https://images.unsplash.com/photo-1650531975416-30c7b43691a6",
  "cocoa-butter-body-lotion":       "https://images.unsplash.com/photo-1703174323653-0455deaf7f11",
  "african-black-soap-bar":         "https://plus.unsplash.com/premium_photo-1683121890177-07ffe91eae43",
  // services
  "svc-hydrafacial":                "https://plus.unsplash.com/premium_photo-1663011293702-32d7522393ca",
  "svc-chemical-peel":              "https://plus.unsplash.com/premium_photo-1661478253345-41d1351f68ae",
  "svc-microneedling":              "https://plus.unsplash.com/premium_photo-1661481689382-4445fd07fd5f",
  "svc-dermaplaning":               "https://images.unsplash.com/photo-1761718209835-c8586b7dcac0",
  "svc-led-light-therapy":          "https://plus.unsplash.com/premium_photo-1713882622141-963d83e74bd1",
  "svc-classic-facial":             "https://images.unsplash.com/photo-1643684391140-c5056cfd3436",
  "svc-acne-facial":                "https://images.unsplash.com/photo-1731514771613-991a02407132",
  "svc-microdermabrasion":          "https://images.unsplash.com/photo-1761718210089-ba3bb5ccb54f",
  "svc-gold-collagen-facial":       "https://images.unsplash.com/photo-1743928217924-77ec5f39c4fb",
  "svc-skin-consultation":          "https://images.unsplash.com/photo-1552256031-811fa8f0a7b1",
};

const CATEGORIES = [
  { name: "Serums",        slug: "serums" },
  { name: "Moisturisers",  slug: "moisturisers" },
  { name: "Cleansers",     slug: "cleansers" },
  { name: "Masks",         slug: "masks" },
  { name: "Sunscreen",     slug: "sunscreen" },
  { name: "Toners & Mists",slug: "toners-mists" },
  { name: "Eye & Lip Care",slug: "eye-lip-care" },
  { name: "Body Care",     slug: "body-care" },
];

// [name, slug, category, price_kes, stock, description]
const PRODUCTS = [
  ["Vitamin C Glow Serum", "vitamin-c-glow-serum", "serums", 2950, 24,
   "A 15% L-ascorbic acid serum that brightens dull skin, fades dark spots and defends against daily environmental stress. Lightweight, fast-absorbing and layered easily under SPF."],
  ["Overnight Recovery Serum", "overnight-recovery-serum", "serums", 3200, 18,
   "A restorative night serum with peptides and squalane that works while you sleep — wake to plumper, calmer, visibly rested skin."],
  ["Hyaluronic Hydra-Boost Serum", "hyaluronic-hydra-boost-serum", "serums", 2650, 30,
   "Multi-weight hyaluronic acid draws moisture into every layer of the skin for an instant, lasting plump. Layers beautifully under moisturiser and makeup."],
  ["Niacinamide 10% + Zinc Serum", "niacinamide-10-zinc-serum", "serums", 2200, 36,
   "Balances oil, tightens the look of pores and calms blemish-prone skin with 10% niacinamide and 1% zinc PCA."],
  ["Retinol Renewal Night Serum", "retinol-renewal-night-serum", "serums", 3400, 15,
   "Encapsulated retinol smooths fine lines and refines texture with minimal irritation. Start twice weekly and build up — always pair with daytime SPF."],

  ["Hydra Repair Moisturiser", "hydra-repair-moisturiser", "moisturisers", 2800, 28,
   "A daily cream with ceramides and glycerin that repairs the moisture barrier and keeps skin soft, supple and comfortable from morning to night."],
  ["Ceramide Barrier Cream", "ceramide-barrier-cream", "moisturisers", 2950, 20,
   "Rich in ceramides and cholesterol, this barrier-first cream rescues dry, stressed or over-exfoliated skin. Fragrance-free and sensitive-skin safe."],
  ["Shea Velvet Night Cream", "shea-velvet-night-cream", "moisturisers", 3100, 16,
   "A cocooning overnight cream with shea butter and niacinamide for deep nourishment — ideal for dry season and air-conditioned offices."],
  ["Oil-Free Gel Moisturiser", "oil-free-gel-moisturiser", "moisturisers", 2400, 32,
   "A featherlight water-gel that hydrates without shine. Perfect for oily and combination skin in Nairobi heat."],

  ["Gentle Renewal Cleanser", "gentle-renewal-cleanser", "cleansers", 1950, 40,
   "A pH-balanced cream cleanser that melts away makeup, sunscreen and the day without stripping. Suitable for sensitive skin."],
  ["Foaming Tea Tree Cleanser", "foaming-tea-tree-cleanser", "cleansers", 1850, 34,
   "A purifying foam with tea tree and salicylic acid that keeps breakouts and excess oil in check without over-drying."],
  ["Creamy Oat Milk Cleanser", "creamy-oat-milk-cleanser", "cleansers", 1900, 26,
   "Colloidal oat and milk proteins cleanse and comfort reactive, easily-flushed skin. No foam, no fragrance, no tightness."],
  ["Micellar Cleansing Water", "micellar-cleansing-water", "cleansers", 1600, 38,
   "Swipe-away cleansing for busy mornings and gym days — removes makeup and grime with zero rinse and zero residue."],

  ["Rose Clay Clarifying Mask", "rose-clay-clarifying-mask", "masks", 2200, 22,
   "Pink kaolin clay lifts congestion and excess oil while rose extract keeps skin calm — a weekly reset for a smooth, even glow."],
  ["Charcoal Detox Mask", "charcoal-detox-mask", "masks", 2100, 25,
   "Activated charcoal and bamboo extract draw out impurities from city-stressed skin. Ten minutes to a clearer complexion."],
  ["Honey & Turmeric Glow Mask", "honey-turmeric-glow-mask", "masks", 2250, 20,
   "Kenyan honey and turmeric brighten and soothe in one golden treatment — your pre-event secret weapon."],
  ["Overnight Sleeping Mask", "overnight-sleeping-mask", "masks", 2500, 18,
   "Seal in your evening routine with this pillow-proof gel mask. Wake up dewy, rested and ready."],

  ["Daily Defence Sunscreen SPF 50", "daily-defence-sunscreen-spf-50", "sunscreen", 2600, 45,
   "Broad-spectrum SPF 50 with a weightless, no-white-cast finish made for melanin-rich skin. The most important step in any routine."],
  ["Tinted Mineral Sunscreen SPF 40", "tinted-mineral-sunscreen-spf-40", "sunscreen", 2750, 27,
   "Zinc-oxide protection with a sheer universal tint that evens tone while it shields — no flashback, no chalk."],
  ["Sun Stick SPF 50+", "sun-stick-spf-50", "sunscreen", 2300, 30,
   "Mess-free, pocket-sized top-ups over makeup. Reapply every two hours without breaking your look."],

  ["Rose Water Toning Mist", "rose-water-toning-mist", "toners-mists", 1500, 42,
   "Pure steam-distilled rose water to refresh, rebalance and set — keep one at your desk and one in your bag."],
  ["Glycolic Radiance Toner", "glycolic-radiance-toner", "toners-mists", 2150, 24,
   "A 7% glycolic acid toner that sweeps away dullness for smoother, brighter skin in two to three weeks. Use at night, SPF by day."],

  ["Caffeine Bright Eye Cream", "caffeine-bright-eye-cream", "eye-lip-care", 2450, 21,
   "Caffeine and peptides de-puff, firm and brighten tired under-eyes. Cooling tip applicator for your 6 a.m. meetings."],
  ["Shea Lip Repair Balm", "shea-lip-repair-balm", "eye-lip-care", 950, 50,
   "Overnight-grade repair for dry, cracked lips with shea butter, lanolin and vitamin E."],

  ["Cocoa Butter Body Lotion", "cocoa-butter-body-lotion", "body-care", 1750, 35,
   "Fast-absorbing daily lotion with cocoa butter and glycerin for soft, even-toned skin from neck to toe."],
  ["African Black Soap Bar", "african-black-soap-bar", "body-care", 1200, 48,
   "Traditional West-African black soap, handmade with plantain ash and shea — a gentle full-body cleanse for blemish-prone skin."],
];

// [name, slug, duration_min, price_kes, image key, description]
const SERVICES = [
  ["HydraFacial", "hydrafacial", 60, 15000, "svc-hydrafacial",
   "Our signature medical-grade facial: a patented vortex device cleanses, exfoliates, extracts and floods the skin with hydrating serums. Instant glow, zero downtime."],
  ["Chemical Peel", "chemical-peel", 45, 12000, "svc-chemical-peel",
   "Clinical-strength AHA/BHA peels matched to your skin by our aestheticians — targets dark spots, acne marks, dullness and uneven texture over a guided course."],
  ["Microneedling", "microneedling", 60, 18000, "svc-microneedling",
   "Collagen-induction therapy with a sterile dermapen to soften acne scars, refine pores and firm the skin. Includes numbing and a calming recovery mask."],
  ["Dermaplaning", "dermaplaning", 40, 8000, "svc-dermaplaning",
   "Precision blade exfoliation that lifts dead skin and peach fuzz for a glass-smooth, makeup-ready finish."],
  ["LED Light Therapy", "led-light-therapy", 30, 6000, "svc-led-light-therapy",
   "Clinical-grade red and blue light to calm inflammation, fight breakout bacteria and boost collagen. Book as a course or add to any facial."],
  ["Classic Deep-Cleanse Facial", "classic-deep-cleanse-facial", 60, 6500, "svc-classic-facial",
   "Steam, double cleanse, gentle extractions, massage and a tailored mask — the essential monthly maintenance facial."],
  ["Acne Clarifying Facial", "acne-clarifying-facial", 60, 8500, "svc-acne-facial",
   "A targeted protocol for congested, blemish-prone skin combining deep extraction, a salicylic infusion and blue-light therapy."],
  ["Microdermabrasion", "microdermabrasion", 45, 9000, "svc-microdermabrasion",
   "Diamond-tip resurfacing buffs away dull surface layers to smooth texture and fade marks — no chemicals, no downtime."],
  ["24K Gold Collagen Facial", "gold-collagen-facial", 75, 12500, "svc-gold-collagen-facial",
   "Our luxury anti-ageing ritual: a gold-infused collagen mask, lifting massage and LED finish for special-occasion radiance."],
  ["Skin Consultation", "skin-consultation", 30, 3500, "svc-skin-consultation",
   "A one-on-one assessment with our skin specialists: in-depth skin analysis, product audit and a personalised treatment plan. Fee redeemable against your first procedure."],
];

// ---- 1. download images from Unsplash + re-host in storage ----
const publicUrl = {};
for (const [key, base] of Object.entries(IMAGES)) {
  const isService = key.startsWith("svc-");
  // product cards are 3:4 portrait; service cards 4:3 landscape
  const size = isService ? "w=1200&h=900" : "w=1200&h=1600";
  const res = await fetch(`${base}?${size}&fit=crop&crop=entropy&q=80&auto=format&fm=jpg`, {
    headers: { "User-Agent": "curl/8.4.0" },
  });
  if (!res.ok) throw new Error(`download failed for ${key}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const path = `seed/${key}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`upload failed for ${key}: ${error.message}`);
  publicUrl[key] = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  console.log(`image ${key} (${(buf.length / 1024).toFixed(0)} KB)`);
}

// ---- 2. categories ----
const { error: catErr } = await supabase
  .from("categories")
  .upsert(CATEGORIES, { onConflict: "slug" });
if (catErr) throw catErr;
const { data: cats } = await supabase.from("categories").select("id, slug");
const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
console.log(`categories: ${cats.length}`);

// ---- 3. products ----
const productRows = PRODUCTS.map(([name, slug, cat, price_kes, stock, description]) => ({
  name, slug, description, price_kes, stock,
  category_id: catId[cat],
  image_urls: [publicUrl[slug]],
  active: true,
}));
const { error: prodErr } = await supabase
  .from("products")
  .upsert(productRows, { onConflict: "slug" });
if (prodErr) throw prodErr;
console.log(`products: ${productRows.length}`);

// ---- 4. services ----
const serviceRows = SERVICES.map(([name, slug, duration_min, price_kes, imgKey, description], i) => ({
  name, slug, description, duration_min, price_kes,
  image_url: publicUrl[imgKey],
  sort_order: i,
  active: true,
}));
const { error: svcErr } = await supabase
  .from("services")
  .upsert(serviceRows, { onConflict: "slug" });
if (svcErr) throw svcErr;
console.log(`services: ${serviceRows.length}`);

console.log("Seed complete.");
