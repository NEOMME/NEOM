"use client";

import { cn } from "@/lib/utils";
import {
  Bot,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";

export type AdminTab =
  | "overview"
  | "applications"
  | "users"
  | "universities"
  | "categories"
  | "promotions"
  | "email"
  | "agent";

const links: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: Layers },
  { id: "users", label: "Users", icon: Users },
  { id: "universities", label: "Universities", icon: GraduationCap },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "email", label: "Email Campaigns", icon: Mail },
  { id: "agent", label: "AI Agent", icon: Bot },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 glass-strong border-r border-white/5 flex flex-col shrink-0">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white">Neom</span>
            <span className="text-[10px] text-violet-400 ml-1 font-mono">ADMIN</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onTabChange(link.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all w-full text-left",
              activeTab === link.id
                ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
