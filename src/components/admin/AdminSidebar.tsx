"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/universities", label: "Universities", icon: GraduationCap },
  { href: "/admin/research", label: "Research", icon: Search },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/ai", label: "Admin AI", icon: Sparkles },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white block">Neom Admin</span>
            <span className="text-xs text-slate-400">Operations Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-600/20 text-blue-300 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/student"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          Student Portal
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
