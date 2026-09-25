"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Bot,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/student/apply", label: "Apply", icon: FileText },
  { href: "/student#ai", label: "AI Assistant", icon: Bot, hash: true },
  { href: "/student/universities", label: "Universities", icon: GraduationCap },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (link: (typeof links)[number]) => {
    if (link.hash) return false;
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  return (
    <aside className="w-64 glass-strong border-r border-white/5 flex flex-col shrink-0">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white">Neom</span>
            <span className="text-[10px] text-cyan-400 ml-1 font-mono">STUDENT</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all",
              isActive(link)
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
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
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
