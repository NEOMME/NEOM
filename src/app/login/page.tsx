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
  const registered = searchParams.get("registered") === "1";
  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const dest = redirect.startsWith("/student") ? redirect : "/student";
    router.push(dest);
    router.refresh();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/student`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetSent(true);
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

      {registered && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-4">
          Account created. Sign in to continue.
        </p>
      )}

      {authError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          Sign in failed. Please try again or create a new account.
        </p>
      )}

      {resetSent && (
        <p className="text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 mb-4">
          Password reset link sent. Check your email.
        </p>
      )}

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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-slate-400">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Forgot password?
            </button>
          </div>
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

      <div className="mt-6 pt-6 border-t border-white/5 text-center space-y-3">
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">
            Create one
          </Link>
        </p>
        <Link href="/" className="inline-block text-sm text-slate-500 hover:text-cyan-400">
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
