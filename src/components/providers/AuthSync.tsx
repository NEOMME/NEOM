"use client";

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
    loadProfile().then((profile) => {
      if (profile) setCurrentStudent(profile);
    });
  }, [setCurrentStudent]);

  return null;
}
