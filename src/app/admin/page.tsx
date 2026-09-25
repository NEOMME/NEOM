"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  FileText,
  GraduationCap,
  Search,
  Users,
} from "lucide-react";
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
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Admin Dashboard
        </h1>
        <p className="text-slate-400">
          Welcome, {currentAdmin?.name ?? "Admin"}. Manage platform operations.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: "Submitted Apps", value: submittedApps, href: "/admin/applications" },
          { icon: GraduationCap, label: "Universities", value: universities.length, href: "/admin/universities" },
          { icon: Search, label: "Pending Research", value: pendingResearch, href: "/admin/research" },
          { icon: Users, label: "Students", value: users.filter((u) => u.role === "student").length, href: "/admin/applications" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="bg-slate-900 border-slate-800 hover:border-blue-600/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
            <Link href="/admin/applications" className="text-sm text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
              >
                <div>
                  <p className="text-sm font-medium text-white">{app.studentName}</p>
                  <p className="text-xs text-slate-400">{app.universityName}</p>
                </div>
                <Badge label={app.status.replace("_", " ")} status={app.status} />
              </div>
            ))}
            {applications.length === 0 && (
              <p className="text-slate-500 text-sm">No applications yet.</p>
            )}
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unread > 0 && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border ${n.read ? "border-slate-800 bg-slate-800/30" : "border-blue-600/30 bg-blue-600/5"}`}
              >
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-slate-400 mt-1">{n.body}</p>
                <p className="text-xs text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
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
