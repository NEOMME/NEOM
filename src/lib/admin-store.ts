"use client";

import { create } from "zustand";
import type {
  Application,
  EmailCampaign,
  Notification,
  Promotion,
  StagingUniversity,
  University,
  User,
} from "./types";
import type { Country, UniversityCategory } from "./types";

interface AdminData {
  countries: Country[];
  categories: UniversityCategory[];
  universities: University[];
  users: User[];
  applications: Application[];
  promotions: Promotion[];
  emailCampaigns: EmailCampaign[];
  staging: StagingUniversity[];
  notifications: Notification[];
}

interface AdminStore extends AdminData {
  currentAdmin: User | null;
  adminChat: { id: string; role: "user" | "assistant"; content: string; timestamp: string }[];
  loading: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addAdminMessage: (msg: { id: string; role: "user" | "assistant"; content: string; timestamp: string }) => void;
  refresh: () => Promise<void>;
}

const empty: AdminData = {
  countries: [],
  categories: [],
  universities: [],
  users: [],
  applications: [],
  promotions: [],
  emailCampaigns: [],
  staging: [],
  notifications: [],
};

export const useAdminStore = create<AdminStore>()((set, get) => ({
  ...empty,
  currentAdmin: null,
  adminChat: [],
  loading: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ loading: true });

    try {
      const [platformRes, chatRes] = await Promise.all([
        fetch("/api/admin/platform"),
        fetch("/api/ai/admin"),
      ]);

      if (!platformRes.ok) throw new Error("Failed to load admin data");

      const data = await platformRes.json();
      const chatData = chatRes.ok ? await chatRes.json() : { history: [] };

      set({
        ...data,
        currentAdmin: data.currentUser,
        adminChat: chatData.history ?? [],
        loading: false,
        hydrated: true,
      });
    } catch {
      set({ loading: false, hydrated: true });
    }
  },

  addAdminMessage: (msg) =>
    set((s) => ({ adminChat: [...s.adminChat, msg] })),

  refresh: async () => {
    set({ hydrated: false });
    await get().hydrate();
  },
}));
