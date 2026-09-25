"use client";

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

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Universities</h1>
      <p className="text-slate-400 mb-6">
        Manage partner universities. Approve researched entries from the Research page.
      </p>

      <div className="space-y-3">
        {universities.map((uni) => {
          const country = countries.find((c) => c.id === uni.countryId);
          return (
            <Card key={uni.id} className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-white">{uni.name}</h3>
                  <p className="text-sm text-slate-400">
                    {country?.flag} {country?.name} · Rank #{uni.ranking} · {uni.tuition}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {uni.programs.slice(0, 3).join(", ")}
                    {uni.programs.length > 3 && ` +${uni.programs.length - 3} more`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={uni.published ? "ghost" : "primary"}
                  disabled={toggling === uni.id}
                  onClick={() => togglePublished(uni.id, uni.published)}
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
