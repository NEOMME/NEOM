"use client";

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

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Students & users</h1>
      <p className="text-slate-400 mb-6">
        Registered accounts on the platform ({users.length} total).
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "student", "admin"] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setFilter(role)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              filter === role
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {role === "all" ? "All users" : `${role}s`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((user) => (
          <Card key={user.id} className="bg-slate-900 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white">{user.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{user.email}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {user.country ? `${user.country} · ` : ""}
                  Joined {formatDate(user.createdAt)}
                  {user.role === "student" && (
                    <> · {appCountByStudent.get(user.id) ?? 0} application(s)</>
                  )}
                </p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-500">No users match this filter.</p>
        )}
      </div>
    </div>
  );
}
