// Scrape Unsplash search for candidate seed images (id, url, alt, size).
// Output: scripts/seed-images.json  — reviewed manually before seeding.
const QUERIES = [
  "serum dropper bottle skincare",
  "vitamin c serum bottle",
  "face cream jar skincare",
  "moisturizer cream open jar",
  "facial cleanser bottle",
  "face wash foam skincare",
  "micellar water bottle",
  "clay face mask skincare",
  "charcoal face mask",
  "sheet mask skincare",
  "sunscreen bottle spf",
  "sunscreen cream tube",
  "facial toner bottle",
  "face mist spray bottle",
  "eye cream skincare",
  "lip balm cosmetics",
  "body lotion bottle",
  "black soap natural",
  "facial treatment spa woman",
  "spa facial massage",
  "hydrafacial treatment",
  "chemical peel facial treatment",
  "microneedling dermapen treatment",
  "led light therapy face",
  "dermaplaning facial",
  "skin consultation dermatologist",
  "microdermabrasion facial",
  "anti aging facial treatment",
  "acne facial treatment clinic",
  "collagen facial gold mask",
];

const out = {};
for (const q of QUERIES) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=8&orientation=portrait`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "curl/8.4.0" } });
    if (!res.ok) { console.error(`FAIL ${q}: HTTP ${res.status}`); continue; }
    const json = await res.json();
    out[q] = (json.results ?? []).map((r) => ({
      id: r.id,
      raw: r.urls?.raw?.split("?")[0],
      alt: r.alt_description ?? r.description ?? "",
      w: r.width, h: r.height, likes: r.likes,
    }));
    console.log(`${q}: ${out[q].length} results`);
  } catch (e) {
    console.error(`FAIL ${q}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 400));
}

await import("node:fs").then((fs) =>
  fs.writeFileSync(new URL("./seed-images.json", import.meta.url), JSON.stringify(out, null, 1)),
);
console.log("wrote scripts/seed-images.json");
