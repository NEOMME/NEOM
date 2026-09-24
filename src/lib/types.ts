export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected";

export type UserRole = "student" | "admin";

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export interface UniversityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface University {
  id: string;
  name: string;
  countryId: string;
  categoryIds: string[];
  description: string;
  tuition: string;
  ranking: number;
  programs: string[];
  deadline: string;
  published: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country?: string;
  createdAt: string;
}

export interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  universityId: string;
  universityName: string;
  countryName: string;
  status: ApplicationStatus;
  steps: ApplicationStep[];
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    phone: string;
  };
  academicInfo: {
    degree: string;
    gpa: string;
    institution: string;
    graduationYear: string;
  };
  documents: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "scheduled" | "sent";
  recipients: number;
  sentAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
