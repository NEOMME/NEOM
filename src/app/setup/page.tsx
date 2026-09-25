"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Database, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SetupStatus = {
  connected: boolean;
  tablesReady: boolean;
  message?: string;
  siteUrl?: string;
};

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() =>
        setStatus({ connected: false, tablesReady: false, message: "Failed to check status" })
      );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      setResult(data.message ?? (res.ok ? "Seed complete!" : data.error));
      if (res.ok) refresh();
    } catch {
      setResult("Seed request failed");
    } finally {
      setLoading(false);
    }
  };

  const productionUrl = "https://neom-production.up.railway.app";

  return (
    <main className="min-h-screen bg-[#030712] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Neom Setup</h1>
            <p className="text-slate-400">One-time platform configuration (developer use).</p>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Status</h2>
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
              {status.message && <p className="text-sm text-slate-400">{status.message}</p>}
            </div>
          )}
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-3">Step 1 — Supabase Auth URLs</h2>
          <p className="text-sm text-slate-400 mb-3">
            In{" "}
            <a
              href="https://supabase.com/dashboard/project/ytdhzjdwfhtxzmobikzp/auth/url-configuration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline inline-flex items-center gap-1"
            >
              Supabase → Authentication → URL Configuration
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <div className="text-xs font-mono bg-slate-900/50 rounded-lg p-3 space-y-2 text-slate-300">
            <p><span className="text-slate-500">Site URL:</span> {productionUrl}</p>
            <p><span className="text-slate-500">Redirect:</span> {productionUrl}/api/auth/callback</p>
            <p><span className="text-slate-500">Local redirect:</span> http://localhost:3000/api/auth/callback</p>
          </div>
        </Card>

        {!status?.tablesReady && (
          <Card className="mb-6">
            <h2 className="font-semibold text-white mb-3">Step 2 — Run Database Migration</h2>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside mb-4">
              <li>
                Open{" "}
                <a
                  href="https://supabase.com/dashboard/project/ytdhzjdwfhtxzmobikzp/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  Supabase SQL Editor
                </a>
              </li>
              <li>
                Paste contents of{" "}
                <code className="text-cyan-300">supabase/migrations/001_initial_schema.sql</code>
              </li>
              <li>Click <strong>Run</strong>, then refresh this page</li>
            </ol>
            <p className="text-xs text-slate-500">
              Or add <code>SUPABASE_DB_URL</code> to env and run <code>npm run db:migrate</code>
            </p>
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-3">
            Step {status?.tablesReady ? "2" : "3"} — Seed Platform Data
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Loads countries, categories, partner universities, and promotions.
          </p>
          <Button onClick={runSeed} disabled={loading || !status?.tablesReady}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Seeding..." : "Run Seed"}
          </Button>
          {result && (
            <p
              className={`text-sm mt-3 whitespace-pre-wrap ${
                result.includes("complete") ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {result}
            </p>
          )}
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-3">Go Live</h2>
          <p className="text-sm text-slate-400">
            Once setup is complete, users can create accounts at{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">/signup</Link>{" "}
            and start applying.
          </p>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
          <a href={productionUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              Live Site
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
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
