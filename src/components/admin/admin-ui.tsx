"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export const adminInputClass =
  "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-slate-600 mt-1.5 text-sm sm:text-base max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AdminFilterTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border",
            value === opt.id
              ? "bg-blue-700 text-white border-blue-700 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span
              className={cn(
                "ml-1.5 tabular-nums",
                value === opt.id ? "text-blue-100" : "text-slate-400"
              )}
            >
              ({opt.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-shadow group-hover:shadow-md group-hover:border-blue-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <Icon className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <Card className="text-center py-12">
      <p className="text-slate-500 text-sm">{message}</p>
    </Card>
  );
}

export function AdminSectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900 mb-4", className)}>{children}</h2>
  );
}
