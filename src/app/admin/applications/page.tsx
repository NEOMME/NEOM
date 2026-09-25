"use client";

import { ApplicationDetailPanel } from "@/components/admin/ApplicationDetailPanel";
import { AdminEmptyState, AdminFilterTabs, AdminPageHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import type { ApplicationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

const STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "accepted",
  "rejected",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminApplicationsPage() {
  const { applications, refresh } = useAdminStore();
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: "All", count: applications.length },
      ...STATUSES.map((s) => ({
        id: s,
        label: s.replace("_", " "),
        count: applications.filter((a) => a.status === s).length,
      })),
    ],
    [applications]
  );

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    setUpdating(id);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
    setUpdating(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="Applications"
        description="Review student submissions, update status, and open full applicant details."
      />

      <AdminFilterTabs
        value={filter}
        onChange={setFilter}
        options={filterOptions.map((o) => ({
          id: o.id,
          label: o.label.charAt(0).toUpperCase() + o.label.slice(1),
          count: o.count,
        }))}
      />

      <div className="space-y-3">
        {filtered.map((app) => {
          const expanded = expandedId === app.id;
          return (
            <Card key={app.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold flex items-center justify-center shrink-0"
                    aria-hidden
                  >
                    {initials(app.studentName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{app.studentName}</h3>
                    <p className="text-sm text-slate-600">
                      {app.universityName}
                      {app.countryName ? ` · ${app.countryName}` : ""}
                    </p>
                    {app.studentEmail && (
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{app.studentEmail}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Updated {formatDate(app.updatedAt)} · GPA {app.academicInfo.gpa || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0 sm:justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Details
                      </>
                    )}
                  </Button>
                  <Badge label={app.status.replace("_", " ")} status={app.status} />
                  {app.status === "submitted" && (
                    <Button
                      size="sm"
                      disabled={updating === app.id}
                      onClick={() => updateStatus(app.id, "under_review")}
                    >
                      Review
                    </Button>
                  )}
                  {app.status === "under_review" && (
                    <>
                      <Button
                        size="sm"
                        disabled={updating === app.id}
                        onClick={() => updateStatus(app.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updating === app.id}
                        onClick={() => updateStatus(app.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {expanded && <ApplicationDetailPanel app={app} />}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <AdminEmptyState message="No applications match this filter." />
        )}
      </div>
    </div>
  );
}
