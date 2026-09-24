import { createAdminClient } from "@/lib/supabase/admin";
import { execSync } from "child_process";
import { NextResponse } from "next/server";
import { join } from "path";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("countries").select("id").limit(1);

    if (error) {
      return NextResponse.json({
        connected: true,
        tablesReady: false,
        message: error.message.includes("Could not find the table")
          ? "Tables not created yet. Run the migration SQL first."
          : error.message,
      });
    }

    const { count } = await supabase
      .from("countries")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      connected: true,
      tablesReady: true,
      message: count ? `Database ready with ${count} countries.` : "Tables ready — run seed to populate data.",
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      tablesReady: false,
      message: err instanceof Error ? err.message : "Supabase not configured",
    });
  }
}

export async function POST() {
  try {
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
        : "Seed failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
