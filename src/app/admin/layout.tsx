"use client";

import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useAdminStore } from "@/lib/admin-store";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hydrate, loading, hydrated } = useAdminStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <AdminMobileNav />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
