"use client";

import { create } from "zustand";
import type {
  Application,
  ChatMessage,
  Country,
  EmailCampaign,
  Promotion,
  University,
  UniversityCategory,
  User,
} from "./types";

interface PlatformData {
  countries: Country[];
  categories: UniversityCategory[];
  universities: University[];
  users: User[];
  applications: Application[];
  promotions: Promotion[];
  emailCampaigns: EmailCampaign[];
}

const emptyData: PlatformData = {
  countries: [],
  categories: [],
  universities: [],
  users: [],
  applications: [],
  promotions: [],
  emailCampaigns: [],
};

interface NeomStore extends PlatformData {
  studentChat: ChatMessage[];
  currentStudent: User | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  chatLoaded: boolean;

  hydrate: () => Promise<void>;
  loadStudentChat: () => Promise<void>;
  setCurrentStudent: (user: User | null) => void;
  addApplication: (
    application: Omit<
      Application,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "universityName"
      | "countryName"
      | "studentName"
      | "studentEmail"
    >
  ) => Promise<Application | null>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<Application | null>;
  addStudentMessage: (message: ChatMessage) => void;
  setStudentChat: (messages: ChatMessage[]) => void;
}

export const useNeomStore = create<NeomStore>()((set, get) => ({
  ...emptyData,
  studentChat: [],
  currentStudent: null,
  loading: false,
  error: null,
  hydrated: false,
  chatLoaded: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/platform");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load platform data");
      }

      const data = await res.json();
      const { currentUser, ...platform } = data as PlatformData & {
        currentUser?: User;
      };
      set({
        ...platform,
        currentStudent: currentUser ?? get().currentStudent,
        loading: false,
        hydrated: true,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to the platform";
      set({
        ...emptyData,
        loading: false,
        hydrated: true,
        error: message,
      });
    }
  },

  loadStudentChat: async () => {
    if (get().chatLoaded) return;
    try {
      const res = await fetch("/api/ai/student");
      if (res.ok) {
        const data = await res.json();
        set({ studentChat: data.history ?? [], chatLoaded: true });
      }
    } catch {
      set({ chatLoaded: true });
    }
  },

  setCurrentStudent: (user) => set({ currentStudent: user }),

  addApplication: async (application) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });

    if (!res.ok) return null;

    const created: Application = await res.json();
    set((s) => ({
      applications: [
        created,
        ...s.applications.filter((a) => a.id !== created.id),
      ],
    }));
    return created;
  },

  updateApplication: async (id, updates) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) return null;

    const updated: Application = await res.json();
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },

  addStudentMessage: (message) =>
    set((s) => ({ studentChat: [...s.studentChat, message] })),

  setStudentChat: (messages) => set({ studentChat: messages }),
}));
