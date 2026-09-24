"use client";

import SceneBackground from "@/components/3d/SceneBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/student";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_id", data.user.id)
      .maybeSingle();

    const dest =
      profile?.role === "admin" && redirect === "/student" ? "/admin" : redirect;

    router.push(dest);
    router.refresh();
  };

  return (
    <Card glow className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign in to Neom</h1>
        <p className="text-sm text-slate-400 mt-1">NEMP — AI-Powered Applications</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/5 text-center">
        <p className="text-xs text-slate-500 mb-2">Demo accounts (after setup):</p>
        <p className="text-xs text-slate-400">admin@neom.edu · ahmed@student.com</p>
        <p className="text-xs text-slate-500">Password: NeomAdmin2026! / NeomStudent2026!</p>
        <Link href="/" className="inline-block mt-4 text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to home
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen grid-bg flex items-center justify-center p-6">
      <SceneBackground />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
