// One-off: create (or promote) the admin user with app_metadata.role = 'admin'.
// Usage: node scripts/create-admin.mjs <email> <password>
// Reads SUPABASE_URL + SERVICE_ROLE_KEY from .env. Service-role key is never
// shipped to the browser; this runs locally only.
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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const [email, password] = process.argv.slice(2);

if (!url || !serviceKey) throw new Error("Missing Supabase URL or service-role key in .env");
if (!email || !password) throw new Error("Usage: node scripts/create-admin.mjs <email> <password>");

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Find an existing user with this email (list is paginated; first page is plenty here).
const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) throw listErr;
const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (existing) {
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    app_metadata: { ...existing.app_metadata, role: "admin" },
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Updated existing admin user: ${data.user.email} (id ${data.user.id})`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) throw error;
  console.log(`Created admin user: ${data.user.email} (id ${data.user.id})`);
}
