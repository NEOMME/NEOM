import type {
  Application,
  ApplicationStep,
  Country,
  EmailCampaign,
  Promotion,
  StagingUniversity,
  University,
  UniversityCategory,
  User,
} from "../types";

type DbApplication = {
  id: string;
  student_id: string | null;
  university_id: string;
  status: string;
  steps: unknown;
  personal_info: unknown;
  academic_info: unknown;
  documents: unknown;
  notes: string;
  created_at: string;
  updated_at: string;
  profiles?: { name: string; email: string } | null;
  universities?: {
    name: string;
    countries?: { name: string } | null;
  } | null;
};

export function mapCountry(row: { id: string; name: string; code: string; flag: string }): Country {
  return { id: row.id, name: row.name, code: row.code, flag: row.flag };
}

export function mapCategory(row: {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}): UniversityCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
  };
}

export function mapUniversity(
  row: {
    id: string;
    name: string;
    country_id: string;
    description: string;
    tuition: string;
    ranking: number;
    programs: unknown;
    deadline: string;
    published: boolean;
  },
  categoryIds: string[]
): University {
  return {
    id: row.id,
    name: row.name,
    countryId: row.country_id,
    categoryIds,
    description: row.description,
    tuition: row.tuition,
    ranking: row.ranking,
    programs: Array.isArray(row.programs) ? (row.programs as string[]) : [],
    deadline: row.deadline,
    published: row.published,
  };
}

export function mapProfile(row: {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  country: string | null;
  created_at: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    country: row.country ?? undefined,
    createdAt: row.created_at.split("T")[0],
  };
}

export function mapApplication(row: DbApplication & Record<string, unknown>): Application {
  const personal = (row.personal_info ?? {}) as Application["personalInfo"];
  const academic = (row.academic_info ?? {}) as Application["academicInfo"];
  const steps = (row.steps ?? []) as ApplicationStep[];
  const documents = Array.isArray(row.documents) ? (row.documents as string[]) : [];

  return {
    id: row.id,
    studentId: row.student_id ?? "",
    studentName: row.profiles?.name ?? personal.fullName ?? "Unknown",
    studentEmail: row.profiles?.email ?? "",
    universityId: row.university_id,
    universityName: row.universities?.name ?? "",
    countryName: row.universities?.countries?.name ?? "",
    status: row.status as Application["status"],
    steps,
    personalInfo: personal,
    academicInfo: academic,
    documents,
    notes: row.notes,
    createdAt: row.created_at.split("T")[0],
    updatedAt: row.updated_at.split("T")[0],
  };
}

export function mapPromotion(row: {
  id: string;
  title: string;
  description: string;
  discount: string;
  active: boolean;
  start_date: string;
  end_date: string;
}): Promotion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discount: row.discount,
    active: row.active,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export function mapStagingUniversity(row: Record<string, unknown>): StagingUniversity {
  return {
    id: row.id as string,
    name: row.name as string,
    countryId: (row.country_id as string) ?? undefined,
    categoryIds: Array.isArray(row.category_ids)
      ? (row.category_ids as string[])
      : [],
    description: row.description as string,
    tuition: row.tuition as string,
    ranking: row.ranking as number,
    programs: Array.isArray(row.programs) ? (row.programs as string[]) : [],
    deadline: row.deadline as string,
    sourceUrl: (row.source_url as string) ?? undefined,
    researchNotes: row.research_notes as string,
    status: row.status as StagingUniversity["status"],
    researchedBy: (row.researched_by as string) ?? undefined,
    reviewedBy: (row.reviewed_by as string) ?? undefined,
    createdAt: (row.created_at as string).split("T")[0],
    reviewedAt: row.reviewed_at
      ? (row.reviewed_at as string).split("T")[0]
      : undefined,
  };
}

export function mapEmailCampaign(row: {
  id: string;
  subject: string;
  body: string;
  status: string;
  recipients: number;
  sent_at: string | null;
  created_at: string;
}): EmailCampaign {
  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    status: row.status as EmailCampaign["status"],
    recipients: row.recipients,
    sentAt: row.sent_at ? row.sent_at.split("T")[0] : undefined,
    createdAt: row.created_at.split("T")[0],
  };
}
