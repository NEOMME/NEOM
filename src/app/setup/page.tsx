"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Database, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SetupStatus = {
  connected: boolean;
  tablesReady: boolean;
  message?: string;
};

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, tablesReady: false, message: "Failed to check status" }));
  }, []);

  const runSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();
      setSeedResult(data.message ?? (res.ok ? "Seed complete!" : data.error));
      if (res.ok) {
        const s = await fetch("/api/setup").then((r) => r.json());
        setStatus(s);
      }
    } catch {
      setSeedResult("Seed request failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Supabase Setup</h1>
        <p className="text-slate-400 mb-8">Configure your Neom database connection.</p>

        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Connection Status</h2>
          </div>

          {!status ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </div>
          ) : (
            <div className="space-y-3">
              <StatusRow ok={status.connected} label="Supabase connected" />
              <StatusRow ok={status.tablesReady} label="Database tables ready" />
              {status.message && (
                <p className="text-sm text-slate-400 mt-2">{status.message}</p>
              )}
            </div>
          )}
        </Card>

        {!status?.tablesReady && (
          <Card className="mb-6">
            <h2 className="font-semibold text-white mb-3">Step 1 — Run Migration</h2>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
              <li>Open your <a href="https://supabase.com/dashboard/project/ytdhzjdwfhtxzmobikzp/sql/new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Supabase SQL Editor</a></li>
              <li>Copy the contents of <code className="text-cyan-300">supabase/migrations/001_initial_schema.sql</code></li>
              <li>Paste and click <strong>Run</strong></li>
              <li>Return here and refresh</li>
            </ol>
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-3">Step 2 — Seed Data</h2>
          <p className="text-sm text-slate-400 mb-4">
            Creates demo users, universities, applications, and sample content.
          </p>
          <Button onClick={runSeed} disabled={seeding || !status?.tablesReady}>
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {seeding ? "Seeding..." : "Run Seed"}
          </Button>
          {seedResult && (
            <p className={`text-sm mt-3 ${seedResult.includes("complete") ? "text-emerald-400" : "text-amber-400"}`}>
              {seedResult}
            </p>
          )}
        </Card>

        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="secondary">Go to Login</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400" />
      )}
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}
