import { getCurrentProfile } from "@/lib/auth";
import { fetchPlatformData } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await fetchPlatformData(profile.id);
    return NextResponse.json({ ...data, currentUser: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load platform data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
