import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role,
      country: existing.country ?? undefined,
      createdAt: existing.created_at?.split("T")[0] ?? "",
    });
  }

  const admin = createAdminClient();
  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Student";
  const country = (user.user_metadata?.country as string | undefined) ?? null;

  const { data: created, error } = await admin
    .from("profiles")
    .insert({
      auth_id: user.id,
      name,
      email: user.email!,
      role: "student",
      country,
    })
    .select("*")
    .single();

  if (error) {
    const { data: fallback } = await admin
      .from("profiles")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (fallback) {
      return NextResponse.json({
        id: fallback.id,
        name: fallback.name,
        email: fallback.email,
        role: fallback.role,
        country: fallback.country ?? undefined,
        createdAt: fallback.created_at?.split("T")[0] ?? "",
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role,
    country: created.country ?? undefined,
    createdAt: created.created_at?.split("T")[0] ?? "",
  });
}
