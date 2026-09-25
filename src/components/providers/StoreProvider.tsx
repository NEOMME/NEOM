"use client";

import { useNeomStore } from "@/lib/store";
import Link from "next/link";
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
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isDbError =
      error.includes("Could not find the table") ||
      error.includes("Failed to load platform data");

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6">
        <div className="text-center max-w-md">
          <p className="text-white font-medium mb-2">
            {isDbError ? "Platform not ready yet" : "Unable to load platform"}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {isDbError
              ? "The database needs to be set up before you can use the student portal."
              : error}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => hydrate()}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              Try again
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-cyan-400">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
