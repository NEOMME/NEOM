import { isNextResponse, requireAdmin } from "@/lib/auth";
import { fetchAdminData } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await requireAdmin();
    if (isNextResponse(profile)) return profile;

    const data = await fetchAdminData();
    return NextResponse.json({ ...data, currentUser: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load admin data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
