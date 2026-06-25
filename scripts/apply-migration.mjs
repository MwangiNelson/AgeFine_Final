// Apply a SQL migration to the Supabase Postgres DB over the direct connection.
// Usage: node scripts/apply-migration.mjs supabase/migrations/0006_rbac.sql
// Reads SUPABASE_DIRECT_CONNECTION_STRING from .env. Runs the file in one
// transaction. Migrations should be idempotent (drop ... if exists / create or replace).
import { readFileSync } from "node:fs";
import pg from "pg";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv(new URL("../.env", import.meta.url));
const connectionString = env.SUPABASE_DIRECT_CONNECTION_STRING;
const file = process.argv[2];

if (!connectionString) throw new Error("Missing SUPABASE_DIRECT_CONNECTION_STRING in .env");
if (!file) throw new Error("Usage: node scripts/apply-migration.mjs <path-to-sql>");

const sql = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

await client.connect();
try {
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`Applied ${file} successfully.`);
} catch (e) {
  await client.query("rollback");
  console.error(`Migration failed, rolled back: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
