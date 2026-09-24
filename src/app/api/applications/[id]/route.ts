import { updateApplicationStatus } from "@/lib/db/queries";
import type { ApplicationStatus } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const application = await updateApplicationStatus(id, status as ApplicationStatus);
    return NextResponse.json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
