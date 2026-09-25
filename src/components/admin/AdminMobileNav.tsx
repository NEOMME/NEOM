"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Home", exact: true },
  { href: "/admin/applications", label: "Apps" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/universities", label: "Unis" },
  { href: "/admin/research", label: "Research" },
  { href: "/admin/emails", label: "Email" },
  { href: "/admin/ai", label: "AI" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 border-b border-slate-200 bg-white neom-scrollbar">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              active
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-600 border-slate-200"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
