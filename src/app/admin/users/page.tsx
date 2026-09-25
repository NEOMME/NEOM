"use client";

import { AdminEmptyState, AdminFilterTabs, AdminPageHeader } from "@/components/admin/admin-ui";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { formatDate } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function AdminUsersPage() {
  const { users, applications } = useAdminStore();
  const [filter, setFilter] = useState<"all" | "student" | "admin">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter);
  }, [users, filter]);

  const appCountByStudent = useMemo(() => {
    const map = new Map<string, number>();
    for (const app of applications) {
      if (!app.studentId) continue;
      map.set(app.studentId, (map.get(app.studentId) ?? 0) + 1);
    }
    return map;
  }, [applications]);

  const studentCount = users.filter((u) => u.role === "student").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="Students & users"
        description={`${users.length} registered accounts on the platform.`}
      />

      <AdminFilterTabs
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All", count: users.length },
          { id: "student", label: "Students", count: studentCount },
          { id: "admin", label: "Admins", count: adminCount },
        ]}
      />

      <div className="space-y-3">
        {filtered.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                        user.role === "admin"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {user.country ? `${user.country} · ` : ""}
                    Joined {formatDate(user.createdAt)}
                    {user.role === "student" && (
                      <> · {appCountByStudent.get(user.id) ?? 0} application(s)</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <AdminEmptyState message="No users match this filter." />}
      </div>
    </div>
  );
}
