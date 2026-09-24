import { fetchPlatformData } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await fetchPlatformData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load platform data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
