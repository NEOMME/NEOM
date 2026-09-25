import { createAdminClient } from "../supabase/admin";
import type { Application, ApplicationStatus, UniversityCategory } from "../types";
import {
  mapApplication,
  mapCategory,
  mapCountry,
  mapPromotion,
  mapUniversity,
} from "./mappers";

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

export async function createApplication(
  data: Omit<Application, "id" | "createdAt" | "updatedAt" | "universityName" | "countryName" | "studentName" | "studentEmail">
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
    .select(
      `*, profiles(name, email), universities(name, countries(name))`
    )
    .single();

  if (error) throw error;
  return mapApplication(row);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select(`*, profiles(name, email), universities(name, countries(name))`)
    .single();

  if (error) throw error;
  return mapApplication(row);
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
