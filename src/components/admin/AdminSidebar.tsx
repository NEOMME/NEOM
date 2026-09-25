"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/users", label: "Students", icon: Users },
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
      <div className="p-6 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-700">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block leading-tight">Neom Admin</span>
            <span className="text-xs text-slate-500">Operations</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-50 text-blue-800 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <link.icon className={cn("w-4 h-4", active ? "text-blue-700" : "text-slate-400")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-0.5">
        <Link
          href="/student"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          Student portal
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
