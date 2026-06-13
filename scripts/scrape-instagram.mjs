// Scrape the client's public Instagram feed (@agefine_beauty) via the picnob
// mirror to gather real post captions + image URLs for seeding service content.
// Output: scripts/ig-posts.json — reviewed/curated manually before any seeding.
//
// Usage: node scripts/scrape-instagram.mjs [pages]
const USERNAME = "agefine_beauty";
const USERID = "26289176032";
const PAGES = Number(process.argv[2] ?? 12);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Node's fetch gets 403'd (TLS fingerprint); curl passes — shell out to it.
import { execFileSync } from "node:child_process";
function curl(url) {
  return execFileSync(
    "curl",
    ["-s", "-H", `User-Agent: ${UA}`, "-H", `Referer: https://www.picnob.com/profile/${USERNAME}/`, url],
    { maxBuffer: 32 * 1024 * 1024 },
  ).toString("utf-8");
}

// Page 1: parse the profile HTML for the initial cursor.
const html = curl(`https://www.picnob.com/profile/${USERNAME}/`);
const next0 = html.match(/data-next="([^"]*)"/)?.[1] ?? "";
const maxid0 = html.match(/data-maxid="([^"]*)"/)?.[1] ?? "";

const posts = [];
const seen = new Set();

function takeItems(items) {
  for (const it of items ?? []) {
    if (seen.has(it.shortcode)) continue;
    seen.add(it.shortcode);
    posts.push({
      shortcode: it.shortcode,
      type: it.type,
      is_video: !!it.is_video,
      time: it.time,
      ftime: it.ftime,
      likes: it.count_like,
      caption: (it.sum ?? "").replaceAll("&amp;", "&"),
      pic: it.pic ?? it.thum ?? "",
    });
  }
}

let next = next0;
let maxid = maxid0;
for (let page = 0; page < PAGES && next; page++) {
  const qs = new URLSearchParams({ username: USERNAME, userid: USERID, next, maxid, hl: "en" });
  let json;
  try {
    json = JSON.parse(curl(`https://www.picnob.com/api/posts?${qs}`));
  } catch {
    console.error(`page ${page}: bad response — stopping`);
    break;
  }
  takeItems(json.posts?.items);
  next = json.posts?.has_next ? json.posts?.next : "";
  maxid = json.posts?.maxid ?? "";
  console.log(`page ${page}: total ${posts.length} posts, has_next=${!!next}`);
  await new Promise((r) => setTimeout(r, 600));
}

const fs = await import("node:fs");
fs.writeFileSync(new URL("./ig-posts.json", import.meta.url), JSON.stringify(posts, null, 1));
console.log(`wrote scripts/ig-posts.json (${posts.length} posts)`);
