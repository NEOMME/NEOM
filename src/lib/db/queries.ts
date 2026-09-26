import { createAdminClient } from "../supabase/admin";
import type {
  Application,
  ApplicationStatus,
  Notification,
  StagingUniversity,
  University,
  UniversityCategory,
  UniversitySearchFilters,
  User,
} from "../types";
import {
  mapApplication,
  mapCategory,
  mapCountry,
  mapEmailCampaign,
  mapProfile,
  mapPromotion,
  mapStagingUniversity,
  mapUniversity,
} from "./mappers";

function parseTuition(tuition: string): number {
  const match = tuition.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

export function searchUniversities(
  universities: University[],
  countries: { id: string; name: string }[],
  filters: UniversitySearchFilters
): University[] {
  return universities.filter((u) => {
    if (filters.publishedOnly && !u.published) return false;
    if (filters.countryId && u.countryId !== filters.countryId) return false;
    if (filters.categoryId && !u.categoryIds.includes(filters.categoryId)) return false;
    if (filters.programKeyword) {
      const kw = filters.programKeyword.toLowerCase();
      const match = u.programs.some((p) => p.toLowerCase().includes(kw));
      if (!match && !u.name.toLowerCase().includes(kw)) return false;
    }
    if (filters.maxTuition !== undefined && parseTuition(u.tuition) > filters.maxTuition) {
      return false;
    }
    return true;
  });
}

export async function fetchPlatformData(studentId?: string) {
  const supabase = createAdminClient();

  const [
    countriesRes,
    categoriesRes,
    universitiesRes,
    uniCatsRes,
    applicationsRes,
    promotionsRes,
  ] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("universities").select("*").order("ranking"),
    supabase.from("university_categories").select("*"),
    studentId
      ? supabase
          .from("applications")
          .select(`*, profiles(name, email), universities(name, countries(name))`)
          .eq("student_id", studentId)
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("promotions")
      .select("*")
      .eq("active", true)
      .order("start_date", { ascending: false }),
  ]);

  const firstError =
    countriesRes.error ??
    categoriesRes.error ??
    universitiesRes.error ??
    uniCatsRes.error ??
    applicationsRes.error ??
    promotionsRes.error;

  if (firstError) throw firstError;

  const uniCatMap = new Map<string, string[]>();
  for (const row of (uniCatsRes.data ?? []) as { university_id: string; category_id: string }[]) {
    const list = uniCatMap.get(row.university_id) ?? [];
    list.push(row.category_id);
    uniCatMap.set(row.university_id, list);
  }

  return {
    countries: (countriesRes.data ?? []).map(mapCountry),
    categories: (categoriesRes.data ?? []).map(mapCategory),
    universities: (universitiesRes.data ?? []).map((u) =>
      mapUniversity(u, uniCatMap.get(u.id) ?? [])
    ),
    users: [],
    applications: (applicationsRes.data ?? []).map(mapApplication),
    promotions: (promotionsRes.data ?? []).map(mapPromotion),
    emailCampaigns: [],
  };
}

let adminDataCache: { at: number; data: Awaited<ReturnType<typeof fetchAdminDataUncached>> } | null =
  null;
const ADMIN_DATA_CACHE_MS = 20_000;

async function fetchAdminDataUncached() {
  const supabase = createAdminClient();

  const [
    platform,
    usersRes,
    allAppsRes,
    allPromotionsRes,
    emailsRes,
    stagingRes,
    notificationsRes,
  ] = await Promise.all([
    fetchPlatformData(),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select(`*, profiles(name, email), universities(name, countries(name))`)
      .order("updated_at", { ascending: false }),
    supabase.from("promotions").select("*").order("start_date", { ascending: false }),
    supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("universities_staging").select("*").order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
  ]);

  const firstError =
    usersRes.error ??
    allAppsRes.error ??
    allPromotionsRes.error ??
    emailsRes.error ??
    stagingRes.error ??
    notificationsRes.error;

  if (firstError) throw firstError;

  return {
    ...platform,
    users: (usersRes.data ?? []).map(mapProfile),
    applications: (allAppsRes.data ?? []).map(mapApplication),
    promotions: (allPromotionsRes.data ?? []).map(mapPromotion),
    emailCampaigns: (emailsRes.data ?? []).map(mapEmailCampaign),
    staging: (stagingRes.data ?? []).map(mapStagingUniversity),
    notifications: (notificationsRes.data ?? []).map(mapNotification),
  };
}

export function invalidateAdminDataCache() {
  adminDataCache = null;
}

export async function fetchAdminData() {
  const now = Date.now();
  if (adminDataCache && now - adminDataCache.at < ADMIN_DATA_CACHE_MS) {
    return adminDataCache.data;
  }
  const data = await fetchAdminDataUncached();
  adminDataCache = { at: now, data };
  return data;
}

function mapNotification(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: unknown;
  read: boolean;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function createApplication(
  data: Omit<
    Application,
    "id" | "createdAt" | "updatedAt" | "universityName" | "countryName" | "studentName" | "studentEmail"
  >
) {
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("applications")
    .insert({
      student_id: data.studentId || null,
      university_id: data.universityId,
      status: data.status,
      steps: data.steps,
      personal_info: data.personalInfo,
      academic_info: data.academicInfo,
      documents: data.documents,
      notes: data.notes,
    })
    .select(`*, profiles(name, email), universities(name, countries(name))`)
    .single();

  if (error) throw error;

  if (data.status === "submitted") {
    await createNotification({
      type: "application_submitted",
      title: "New application submitted",
      body: `${row.profiles?.name ?? "A student"} applied to ${row.universities?.name ?? "a university"}`,
      metadata: { applicationId: row.id },
    });
  }

  return mapApplication(row);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return updateApplicationFull(id, { status });
}

export async function updateApplicationFull(
  id: string,
  updates: Partial<
    Pick<
      Application,
      "status" | "steps" | "personalInfo" | "academicInfo" | "documents" | "notes" | "universityId"
    >
  >
) {
  const supabase = createAdminClient();

  const payload: Record<string, unknown> = {};
  if (updates.status) payload.status = updates.status;
  if (updates.steps) payload.steps = updates.steps;
  if (updates.personalInfo) payload.personal_info = updates.personalInfo;
  if (updates.academicInfo) payload.academic_info = updates.academicInfo;
  if (updates.documents) payload.documents = updates.documents;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.universityId) payload.university_id = updates.universityId;

  const { data: row, error } = await supabase
    .from("applications")
    .update(payload)
    .eq("id", id)
    .select(`*, profiles(name, email), universities(name, countries(name))`)
    .single();

  if (error) throw error;
  return mapApplication(row);
}

export async function getApplicationById(id: string, studentId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("applications")
    .select(`*, profiles(name, email), universities(name, countries(name))`)
    .eq("id", id);

  if (studentId) query = query.eq("student_id", studentId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapApplication(data) : null;
}

export async function saveChatMessage(
  profileId: string,
  role: "user" | "assistant",
  content: string,
  agentType: "student" | "admin" = "student"
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ profile_id: profileId, role, content, agent_type: agentType })
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    role: data.role as "user" | "assistant",
    content: data.content,
    timestamp: data.created_at,
  };
}

export async function getChatHistory(
  profileId: string,
  agentType: "student" | "admin" = "student",
  limit = 50
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("profile_id", profileId)
    .eq("agent_type", agentType)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: m.created_at,
  }));
}

export async function createNotification(data: {
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("notifications").insert({
    type: data.type,
    title: data.title,
    body: data.body,
    metadata: data.metadata ?? {},
  });
  if (error) throw error;
}

export async function markNotificationsRead(ids?: string[]) {
  const supabase = createAdminClient();
  let query = supabase.from("notifications").update({ read: true });
  if (ids?.length) query = query.in("id", ids);
  else query = query.eq("read", false);
  const { error } = await query;
  if (error) throw error;
}

export async function createCategory(category: UniversityCategory) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("categories").insert({
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
  });

  if (error) throw error;
  return category;
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleUniversityPublished(id: string, published: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("universities").update({ published }).eq("id", id);
  if (error) throw error;
}

export async function togglePromotion(id: string, active: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function createEmailCampaign(data: {
  subject: string;
  body: string;
  status?: "draft" | "scheduled" | "sent";
  recipients?: number;
}) {
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("email_campaigns")
    .insert({
      subject: data.subject,
      body: data.body,
      status: data.status ?? "draft",
      recipients: data.recipients ?? 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapEmailCampaign(row);
}
