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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isDbError =
      error.includes("Could not find the table") ||
      error.includes("Failed to load platform data");

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-900 font-medium mb-2">
            {isDbError ? "Platform not ready yet" : "Unable to load platform"}
          </p>
          <p className="text-sm text-slate-600 mb-4">
            {isDbError
              ? "The database needs to be set up before you can use the student portal."
              : error}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => hydrate()}
              className="text-sm text-blue-700 hover:text-blue-800 font-medium"
            >
              Try again
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-700">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
