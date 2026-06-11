// Quick status check: categories/products counts + storage buckets.
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

const { data: cats } = await supabase.from("categories").select("id, name, slug");
const { data: prods } = await supabase.from("products").select("id, name, slug, image_urls");
const { data: buckets } = await supabase.storage.listBuckets();
const { error: svcErr } = await supabase.from("services").select("id").limit(1);

console.log("categories:", JSON.stringify(cats, null, 1));
console.log("products:", prods?.length, JSON.stringify(prods?.map((p) => p.slug)));
console.log("buckets:", JSON.stringify(buckets?.map((b) => `${b.name} public=${b.public}`)));
console.log("services table:", svcErr ? `MISSING (${svcErr.message})` : "exists");
