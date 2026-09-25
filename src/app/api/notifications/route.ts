import { isNextResponse, requireAdmin } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const profile = await requireAdmin();
  if (isNextResponse(profile)) return profile;

  const { ids } = await req.json().catch(() => ({}));
  await markNotificationsRead(ids);
  return NextResponse.json({ ok: true });
}
