"use client";

import { AdminPageHeader, AdminStatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { formatDate } from "@/lib/utils";
import { Bell, FileText, GraduationCap, Search, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const {
    applications,
    universities,
    users,
    staging,
    notifications,
    currentAdmin,
  } = useAdminStore();

  const pendingResearch = staging.filter((s) => s.status === "pending").length;
  const submittedApps = applications.filter((a) => a.status === "submitted").length;
  const studentCount = users.filter((u) => u.role === "student").length;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Dashboard"
        description={`Welcome back, ${currentAdmin?.name ?? "Admin"}. Here’s what’s happening on the platform.`}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <AdminStatCard icon={FileText} label="Submitted applications" value={submittedApps} href="/admin/applications" />
        <AdminStatCard icon={GraduationCap} label="Partner universities" value={universities.length} href="/admin/universities" />
        <AdminStatCard icon={Search} label="Pending research" value={pendingResearch} href="/admin/research" />
        <AdminStatCard icon={Users} label="Registered students" value={studentCount} href="/admin/users" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent applications</h2>
            <Link href="/admin/applications" className="text-sm text-blue-700 hover:text-blue-800 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 6).map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{app.studentName}</p>
                  <p className="text-xs text-slate-500 truncate">{app.universityName}</p>
                </div>
                <Badge label={app.status.replace("_", " ")} status={app.status} />
              </div>
            ))}
            {applications.length === 0 && (
              <p className="text-slate-500 text-sm py-4">No applications yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              Notifications
              {unread > 0 && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">
                  {unread}
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto neom-scrollbar">
            {notifications.slice(0, 8).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border ${
                  n.read ? "border-slate-100 bg-slate-50/80" : "border-blue-100 bg-blue-50/50"
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.body}</p>
                <p className="text-xs text-slate-400 mt-1.5">{formatDate(n.createdAt)}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-slate-500 text-sm">No notifications.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
