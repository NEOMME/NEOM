import { createApplication } from "@/lib/db/queries";
import type { Application } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const application = await createApplication(body as Application);
    return NextResponse.json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
