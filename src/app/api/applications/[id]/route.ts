import { getCurrentProfile, isNextResponse, requireAdmin, requireProfile } from "@/lib/auth";
import { getApplicationById, updateApplicationFull } from "@/lib/db/queries";
import type { ApplicationStatus } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireProfile();
    if (isNextResponse(profile)) return profile;

    const { id } = await params;
    const app = await getApplicationById(
      id,
      profile.role === "admin" ? undefined : profile.id
    );

    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await getApplicationById(
      id,
      profile.role === "admin" ? undefined : profile.id
    );
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role !== "admin") {
      if (existing.studentId !== profile.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (body.status && body.status !== "draft" && body.status !== "submitted") {
        return NextResponse.json({ error: "Students cannot set this status" }, { status: 403 });
      }
      if (existing.status === "submitted" && body.status === "draft") {
        return NextResponse.json({ error: "Cannot revert submitted application" }, { status: 403 });
      }
    }

    const application = await updateApplicationFull(id, body);
    return NextResponse.json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (isNextResponse(admin)) return admin;

  const { id } = await params;
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
