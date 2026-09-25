"use client";

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
      body: JSON.stringify({ query, countryId: countryId || undefined, categoryId: categoryId || undefined }),
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
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">University Research</h1>
      <p className="text-slate-400 mb-6">
        AI agent researches universities from the web. All results require human approval before publishing.
      </p>

      <Card className="bg-slate-900 border-slate-800 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Run Research
        </h2>
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. top computer science universities in Germany"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="">Any country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="">Any category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={runResearch} disabled={researching || !query.trim()}>
            {researching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              "Start Research"
            )}
          </Button>
          {message && (
            <p className="text-sm text-blue-300 bg-blue-600/10 border border-blue-600/20 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
        </div>
      </Card>

      <h2 className="text-lg font-semibold text-white mb-4">
        Pending Review ({pending.length})
      </h2>
      <div className="space-y-4">
        {pending.map((s) => (
          <Card key={s.id} className="bg-slate-900 border-slate-800">
            <h3 className="font-medium text-white">{s.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{s.description}</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-500">
              <span>Tuition: {s.tuition}</span>
              <span>Deadline: {s.deadline}</span>
              <span>Programs: {s.programs.join(", ")}</span>
              {s.sourceUrl && (
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                  Source
                </a>
              )}
            </div>
            {s.researchNotes && (
              <p className="text-xs text-slate-600 mt-2 italic">{s.researchNotes.slice(0, 200)}</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                disabled={reviewing === s.id}
                onClick={() => review(s.id, "approve")}
              >
                Approve & Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={reviewing === s.id}
                onClick={() => review(s.id, "reject")}
              >
                Reject
              </Button>
            </div>
          </Card>
        ))}
        {pending.length === 0 && (
          <p className="text-slate-500">No pending research. Run a search above to discover universities.</p>
        )}
      </div>
    </div>
  );
}
