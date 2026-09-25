"use client";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { useState } from "react";

export default function AdminUniversitiesPage() {
  const { universities, countries, refresh } = useAdminStore();
  const [toggling, setToggling] = useState<string | null>(null);

  const togglePublished = async (id: string, published: boolean) => {
    setToggling(id);
    await fetch(`/api/universities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    await refresh();
    setToggling(null);
  };

  const publishedCount = universities.filter((u) => u.published).length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="Universities"
        description={`${publishedCount} of ${universities.length} partners visible to students. Approve research results on the Research page.`}
      />

      <div className="space-y-3">
        {universities.map((uni) => {
          const country = countries.find((c) => c.id === uni.countryId);
          return (
            <Card key={uni.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{uni.name}</h3>
                    {!uni.published && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {country?.flag} {country?.name} · Rank #{uni.ranking} · {uni.tuition}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {uni.programs.slice(0, 3).join(", ")}
                    {uni.programs.length > 3 && ` +${uni.programs.length - 3} more`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={uni.published ? "secondary" : "primary"}
                  disabled={toggling === uni.id}
                  onClick={() => togglePublished(uni.id, uni.published)}
                  className="shrink-0"
                >
                  {uni.published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
