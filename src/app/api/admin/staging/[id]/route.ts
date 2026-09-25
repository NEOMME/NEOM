import { isNextResponse, requireAdmin } from "@/lib/auth";
import {
  approveStagingUniversity,
  rejectStagingUniversity,
} from "@/lib/ai/research";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireAdmin();
    if (isNextResponse(profile)) return profile;

    const { id } = await params;
    const { action } = await req.json();

    if (action === "approve") {
      const result = await approveStagingUniversity(id, profile);
      return NextResponse.json(result);
    }

    if (action === "reject") {
      await rejectStagingUniversity(id, profile);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update staging";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
