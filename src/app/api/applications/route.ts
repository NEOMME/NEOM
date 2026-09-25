import { getCurrentProfile } from "@/lib/auth";
import { createApplication } from "@/lib/db/queries";
import type { Application } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const application = await createApplication({
      ...(body as Application),
      studentId: profile.id,
    });
    return NextResponse.json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
