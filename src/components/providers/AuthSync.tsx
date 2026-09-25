"use client";

import { createClient } from "@/lib/supabase/client";
import { useNeomStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { useEffect } from "react";

async function loadProfile(): Promise<User | null> {
  const res = await fetch("/api/profile");
  if (!res.ok) return null;
  return res.json();
}

export function AuthSync() {
  const setCurrentStudent = useNeomStore((s) => s.setCurrentStudent);

  useEffect(() => {
    const supabase = createClient();

    const sync = async () => {
      const profile = await loadProfile();
      if (profile) setCurrentStudent(profile);
    };

    sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        sync();
      } else {
        setCurrentStudent(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentStudent]);

  return null;
}
