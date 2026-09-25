import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional when vars are exported (e.g. railway run)
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const email = process.argv[2] ?? process.env.ADMIN_EMAIL ?? "admin@neom.me";
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "NeomAdmin2026!";
const name = process.argv[4] ?? process.env.ADMIN_NAME ?? "Neom Admin";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensureAdminProfile(authId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_id", authId)
    .maybeSingle();

  if (profile?.role === "admin") return;

  if (profile) {
    const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("auth_id", authId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    auth_id: authId,
    name,
    email,
    role: "admin",
  });
  if (error) throw error;
}

async function main() {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "admin" },
  });

  if (!createError && created.user) {
    await ensureAdminProfile(created.user.id);
    console.log(JSON.stringify({ action: "created", email, name, role: "admin" }));
    return;
  }

  if (!createError?.message?.includes("already been registered")) {
    throw createError ?? new Error("Could not create admin user");
  }

  const existing = await findUserByEmail(email);
  if (!existing) {
    throw new Error(`User ${email} exists but could not be loaded for promotion.`);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
    user_metadata: { ...existing.user_metadata, name, role: "admin" },
    password,
  });
  if (updateError) throw updateError;

  await ensureAdminProfile(existing.id);
  console.log(JSON.stringify({ action: "promoted", email, name, role: "admin" }));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
