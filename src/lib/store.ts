"use client";

import { create } from "zustand";
import {
  categories as seedCategories,
  countries as seedCountries,
  defaultApplications,
  defaultEmailCampaigns,
  defaultPromotions,
  defaultUsers,
  universities as seedUniversities,
} from "./data";
import type {
  Application,
  ApplicationStatus,
  ChatMessage,
  EmailCampaign,
  Promotion,
  University,
  UniversityCategory,
  User,
} from "./types";

interface PlatformData {
  countries: typeof seedCountries;
  categories: UniversityCategory[];
  universities: University[];
  users: User[];
  applications: Application[];
  promotions: Promotion[];
  emailCampaigns: EmailCampaign[];
}

interface NeomStore extends PlatformData {
  studentChat: ChatMessage[];
  adminChat: ChatMessage[];
  currentStudent: User | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setCurrentStudent: (user: User | null) => void;
  addCategory: (category: UniversityCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleUniversityPublished: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  addApplication: (application: Omit<Application, "id" | "createdAt" | "updatedAt" | "universityName" | "countryName" | "studentName" | "studentEmail">) => Promise<Application | null>;
  togglePromotion: (id: string) => Promise<void>;
  addStudentMessage: (message: ChatMessage) => void;
  addAdminMessage: (message: ChatMessage) => void;
}

const fallbackData: PlatformData = {
  countries: seedCountries,
  categories: seedCategories,
  universities: seedUniversities,
  users: defaultUsers,
  applications: defaultApplications,
  promotions: defaultPromotions,
  emailCampaigns: defaultEmailCampaigns,
};

export const useNeomStore = create<NeomStore>()((set, get) => ({
  ...fallbackData,
  studentChat: [],
  adminChat: [],
  currentStudent: null,
  loading: false,
  error: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/platform");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load platform data");
      }

      const data: PlatformData = await res.json();
      const student =
        data.users.find((u) => u.role === "student") ??
        fallbackData.users.find((u) => u.role === "student") ??
        null;

      set({
        ...data,
        currentStudent: get().currentStudent ?? student,
        loading: false,
        hydrated: true,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to Supabase";
      set({
        ...fallbackData,
        currentStudent: fallbackData.users.find((u) => u.role === "student") ?? null,
        loading: false,
        hydrated: true,
        error: message,
      });
    }
  },

  setCurrentStudent: (user) => set({ currentStudent: user }),

  addCategory: async (category) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (res.ok) {
      set((s) => ({ categories: [...s.categories, category] }));
    }
  },

  deleteCategory: async (id) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    }
  },

  toggleUniversityPublished: async (id) => {
    const uni = get().universities.find((u) => u.id === id);
    if (!uni) return;
    const published = !uni.published;

    const res = await fetch(`/api/universities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });

    if (res.ok) {
      set((s) => ({
        universities: s.universities.map((u) =>
          u.id === id ? { ...u, published } : u
        ),
      }));
    }
  },

  updateApplicationStatus: async (id, status) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const updated: Application = await res.json();
      set((s) => ({
        applications: s.applications.map((a) => (a.id === id ? updated : a)),
      }));
    } else {
      set((s) => ({
        applications: s.applications.map((a) =>
          a.id === id
            ? { ...a, status, updatedAt: new Date().toISOString().split("T")[0] }
            : a
        ),
      }));
    }
  },

  addApplication: async (application) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });

    if (res.ok) {
      const created: Application = await res.json();
      set((s) => ({ applications: [created, ...s.applications] }));
      return created;
    }

    const local: Application = {
      ...application,
      id: `app-${Date.now()}`,
      studentName: application.personalInfo.fullName,
      studentEmail: get().currentStudent?.email ?? "",
      universityName: get().universities.find((u) => u.id === application.universityId)?.name ?? "",
      countryName: get().countries.find((c) =>
        get().universities.find((u) => u.id === application.universityId)?.countryId === c.id
      )?.name ?? "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    set((s) => ({ applications: [local, ...s.applications] }));
    return local;
  },

  togglePromotion: async (id) => {
    const promo = get().promotions.find((p) => p.id === id);
    if (!promo) return;
    const active = !promo.active;

    const res = await fetch(`/api/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });

    if (res.ok) {
      set((s) => ({
        promotions: s.promotions.map((p) => (p.id === id ? { ...p, active } : p)),
      }));
    }
  },

  addStudentMessage: (message) =>
    set((s) => ({ studentChat: [...s.studentChat, message] })),

  addAdminMessage: (message) =>
    set((s) => ({ adminChat: [...s.adminChat, message] })),
}));
