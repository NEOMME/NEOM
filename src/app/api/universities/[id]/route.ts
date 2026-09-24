import { toggleUniversityPublished } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { published } = await req.json();
    await toggleUniversityPublished(id, published);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update university";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
