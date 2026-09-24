import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = readFileSync(join(__dirname, "..", file), "utf8");
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
      // ignore missing file
    }
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL.");
  console.error("Get it from Supabase → Settings → Database → Connection string (URI)");
  process.exit(1);
}

const sqlPath = join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql");
const sql = readFileSync(sqlPath, "utf8");

async function main() {
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Running migration...");
  await client.query(sql);
  await client.end();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
