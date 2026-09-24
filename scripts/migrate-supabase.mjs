import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.log("SUPABASE_DB_URL not set.\n");
  console.log("To run migrations automatically:");
  console.log("  1. Go to Supabase Dashboard → Settings → Database");
  console.log("  2. Copy the Connection string (URI mode)");
  console.log("  3. Add to .env.local as SUPABASE_DB_URL=...");
  console.log("  4. Run: npm run db:migrate\n");
  console.log("Or paste supabase/migrations/001_initial_schema.sql into the SQL Editor.");
  process.exit(0);
}

async function main() {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const sqlPath = join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql");
  const sql = readFileSync(sqlPath, "utf8");

  await client.connect();
  console.log("Running migration...");
  await client.query(sql);
  await client.end();
  console.log("✅ Migration complete! Run: npm run db:seed");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
