"use client";

import { adminInputClass, AdminEmptyState, AdminPageHeader, AdminSectionTitle } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export default function AdminResearchPage() {
  const { staging, countries, categories, refresh } = useAdminStore();
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [researching, setResearching] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const runResearch = async () => {
    if (!query.trim()) return;
    setResearching(true);
    setMessage("");

    const res = await fetch("/api/ai/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        countryId: countryId || undefined,
        categoryId: categoryId || undefined,
      }),
    });

    const data = await res.json();
    setMessage(data.message ?? data.error ?? "Research complete");
    setResearching(false);
    await refresh();
  };

  const review = async (id: string, action: "approve" | "reject") => {
    setReviewing(id);
    await fetch(`/api/admin/staging/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setReviewing(null);
    await refresh();
  };

  const pending = staging.filter((s) => s.status === "pending");

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="University research"
        description="Discover new partner schools with AI. Every result needs your approval before students see it."
      />

      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-700" />
          Run research
        </h2>
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. top computer science universities in Germany"
            className={adminInputClass}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className={adminInputClass}
            >
              <option value="">Any country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={adminInputClass}
            >
              <option value="">Any category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={runResearch} disabled={researching || !query.trim()} className="inline-flex items-center gap-2">
            {researching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching…
              </>
            ) : (
              "Start research"
            )}
          </Button>
          {message && (
            <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
        </div>
      </Card>

      <AdminSectionTitle>Pending review ({pending.length})</AdminSectionTitle>
      <div className="space-y-3">
        {pending.map((s) => (
          <Card key={s.id}>
            <h3 className="font-semibold text-slate-900">{s.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{s.description}</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-500">
              <span>Tuition: {s.tuition}</span>
              <span>Deadline: {s.deadline}</span>
              <span className="sm:col-span-2">Programs: {s.programs.join(", ")}</span>
              {s.sourceUrl && (
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline truncate sm:col-span-2"
                >
                  Source link
                </a>
              )}
            </div>
            {s.researchNotes && (
              <p className="text-xs text-slate-500 mt-2 italic line-clamp-3">{s.researchNotes}</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button size="sm" disabled={reviewing === s.id} onClick={() => review(s.id, "approve")}>
                Approve & add
              </Button>
              <Button size="sm" variant="ghost" disabled={reviewing === s.id} onClick={() => review(s.id, "reject")}>
                Reject
              </Button>
            </div>
          </Card>
        ))}
        {pending.length === 0 && (
          <AdminEmptyState message="No pending research. Run a search above to discover universities." />
        )}
      </div>
    </div>
  );
}
