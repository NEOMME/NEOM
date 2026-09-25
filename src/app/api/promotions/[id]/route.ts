import { isNextResponse, requireAdmin } from "@/lib/auth";
import { togglePromotion } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAdmin();
    if (isNextResponse(profile)) return profile;

    const { id } = await params;
    const { active } = await req.json();
    await togglePromotion(id, active);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update promotion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
