/**
 * Applies migration SQL via Supabase SQL endpoint when available,
 * otherwise prints manual instructions.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      process.env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
  } catch {
    // ignore
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;
const sqlPath = join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql");
const sql = readFileSync(sqlPath, "utf8");

async function main() {
  if (!dbUrl) {
    console.log("No SUPABASE_DB_URL — paste SQL manually in Supabase SQL Editor.");
    console.log("File:", sqlPath);
    process.exit(0);
  }

  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Migration applied successfully.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
