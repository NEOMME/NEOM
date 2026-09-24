"use client";

import { useNeomStore } from "@/lib/store";
import { useEffect } from "react";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useNeomStore((s) => s.hydrate);
  const loading = useNeomStore((s) => s.loading);
  const error = useNeomStore((s) => s.error);
  const hydrated = useNeomStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Neom platform...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400">
          Supabase offline — using local fallback.{" "}
          <a href="/setup" className="underline hover:text-amber-300">
            Run database setup
          </a>
        </div>
      )}
      {children}
    </>
  );
}
