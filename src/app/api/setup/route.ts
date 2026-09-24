import { createAdminClient } from "@/lib/supabase/admin";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

async function checkDatabase() {
  const supabase = createAdminClient();
  const { error } = await supabase.from("countries").select("id").limit(1);

  if (error) {
    return {
      connected: true,
      tablesReady: false,
      message: error.message.includes("Could not find the table")
        ? "Tables not created yet. Run migration first."
        : error.message,
    };
  }

  const { count } = await supabase
    .from("countries")
    .select("*", { count: "exact", head: true });

  return {
    connected: true,
    tablesReady: true,
    message: count
      ? `Database ready with ${count} countries.`
      : "Tables ready — run seed to populate data.",
  };
}

export async function GET() {
  try {
    const status = await checkDatabase();
    return NextResponse.json({
      ...status,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : "http://localhost:3000",
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      tablesReady: false,
      message: err instanceof Error ? err.message : "Supabase not configured",
    });
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  const expected = process.env.SETUP_SECRET;

  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "seed";

    if (action === "migrate") {
      if (!process.env.SUPABASE_DB_URL) {
        return NextResponse.json(
          {
            error:
              "SUPABASE_DB_URL not configured. Add your Supabase database connection string.",
          },
          { status: 400 }
        );
      }

      const { default: pg } = await import("pg");
      const sql = readFileSync(
        join(process.cwd(), "supabase", "migrations", "001_initial_schema.sql"),
        "utf8"
      );
      const client = new pg.Client({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      await client.query(sql);
      await client.end();

      return NextResponse.json({ success: true, message: "Migration complete!" });
    }

    const scriptPath = join(process.cwd(), "scripts", "seed-supabase.mjs");
    const output = execSync(`node "${scriptPath}"`, {
      encoding: "utf8",
      env: process.env,
    });

    return NextResponse.json({ success: true, message: "Seed complete!", output });
  } catch (err) {
    const message =
      err instanceof Error
        ? "stdout" in err
          ? String((err as { stdout?: string }).stdout ?? err.message)
          : err.message
        : "Setup failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
