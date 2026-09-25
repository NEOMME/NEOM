import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function Badge({
  label,
  status,
  className,
}: {
  label: string;
  status?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        status
          ? statusColors[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
    >
      {label}
    </span>
  );
}
