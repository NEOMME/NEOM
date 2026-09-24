"use client";

import { createClient } from "@/lib/supabase/client";
import { useNeomStore } from "@/lib/store";
import { useEffect } from "react";

export function AuthSync() {
  const setCurrentStudent = useNeomStore((s) => s.setCurrentStudent);
  const users = useNeomStore((s) => s.users);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile) {
            setCurrentStudent({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              country: profile.country ?? undefined,
              createdAt: profile.created_at?.split("T")[0] ?? "",
            });
          } else {
            const match = users.find((u) => u.email === user.email);
            if (match) setCurrentStudent(match);
          }
        });
    });
  }, [setCurrentStudent, users]);

  return null;
}
