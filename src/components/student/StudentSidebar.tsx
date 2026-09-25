"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  FileText,
  GraduationCap,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/student/apply", label: "Apply", icon: FileText },
  { href: "/student#support", label: "Support", icon: Headphones, hash: true },
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-700">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Neom</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
              isActive(link)
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
