import { getCurrentProfile } from "@/lib/auth";
import { findApplicationDocumentPath } from "@/lib/documents";
import { getApplicationById } from "@/lib/db/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "application-documents";
const SIGNED_URL_TTL_SEC = 3600;

export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      applicationId?: string;
      path?: string;
      fileName?: string;
    };

    const { applicationId, path, fileName } = body;
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId required" }, { status: 400 });
    }
    if (!path && !fileName) {
      return NextResponse.json({ error: "path or fileName required" }, { status: 400 });
    }

    const app = await getApplicationById(
      applicationId,
      profile.role === "admin" ? undefined : profile.id
    );
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    let objectPath = path?.trim() || null;
    if (objectPath && !objectPath.startsWith(`${app.studentId}/`)) {
      return NextResponse.json({ error: "Invalid document path" }, { status: 403 });
    }

    if (!objectPath && fileName) {
      objectPath = await findApplicationDocumentPath(
        app.studentId,
        app.id,
        fileName,
        async (folder) => {
          const { data, error } = await supabase.storage.from(BUCKET).list(folder);
          if (error) return null;
          return data ?? [];
        }
      );
    }

    if (!objectPath) {
      return NextResponse.json(
        { error: "File not found in storage. The applicant may need to re-upload." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SEC);

    if (error || !data?.signedUrl) {
      const message = error?.message ?? "Could not create download link";
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ url: data.signedUrl, path: objectPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to access document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
