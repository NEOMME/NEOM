import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";
import { NextResponse } from "next/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

function mapProfileRow(profile: {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  country: string | null;
  created_at: string | null;
}): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    country: profile.country ?? undefined,
    createdAt: profile.created_at?.split("T")[0] ?? "",
  };
}

export async function getCurrentProfile(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profile) return mapProfileRow(profile);

  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Student";
  const country = (user.user_metadata?.country as string | undefined) ?? null;

  const { data: created } = await admin
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

  if (created) return mapProfileRow(created);

  const { data: fallback } = await admin
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  return fallback ? mapProfileRow(fallback) : null;
}

export async function requireProfile(): Promise<User | NextResponse> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return profile;
}

export async function requireAdmin(): Promise<User | NextResponse> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return profile;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
