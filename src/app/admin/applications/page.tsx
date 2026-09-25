"use client";

import { ApplicationDetailPanel } from "@/components/admin/ApplicationDetailPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import type { ApplicationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "accepted",
  "rejected",
];

export default function AdminApplicationsPage() {
  const { applications, refresh } = useAdminStore();
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

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
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-6">Applications</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((app) => {
          const expanded = expandedId === app.id;
          return (
            <Card key={app.id} className="bg-slate-900 border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white">{app.studentName}</h3>
                  <p className="text-sm text-slate-400">
                    {app.universityName} · {app.countryName}
                  </p>
                  {app.studentEmail && (
                    <p className="text-sm text-slate-300 mt-0.5">{app.studentEmail}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Updated {formatDate(app.updatedAt)} · GPA: {app.academicInfo.gpa || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="inline-flex items-center gap-1"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> View student info
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
          <p className="text-slate-500">No applications match this filter.</p>
        )}
      </div>
    </div>
  );
}
