"use client";

import { useAdminStore } from "@/lib/admin-store";
import { Shield } from "lucide-react";

export function AdminTopBar() {
  const { currentAdmin } = useAdminStore();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 backdrop-blur px-6 lg:px-8 py-3.5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Shield className="w-4 h-4 text-blue-700" />
        <span>Neom operations</span>
      </div>
      {currentAdmin && (
        <div className="text-right min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{currentAdmin.name}</p>
          <p className="text-xs text-slate-500 truncate">{currentAdmin.email}</p>
        </div>
      )}
    </header>
  );
}
