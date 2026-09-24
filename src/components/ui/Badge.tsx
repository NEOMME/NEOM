import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  accepted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  sent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  scheduled: "bg-violet-500/20 text-violet-400 border-violet-500/30",
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
        status ? statusColors[status] ?? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        className
      )}
    >
      {label}
    </span>
  );
}
