"use client";

import SceneBackground from "@/components/3d/SceneBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/student`;

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: form.name,
          role: "student",
          country: form.country || undefined,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/student");
      router.refresh();
      return;
    }

    setNeedsConfirmation(true);
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen grid-bg flex items-center justify-center p-6">
      <SceneBackground />
      <Card glow className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1">Start your university application journey</p>
        </div>

        {needsConfirmation ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-emerald-400 font-medium">Check your email</p>
            <p className="text-sm text-slate-400">
              We sent a confirmation link to <span className="text-white">{form.email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Link href="/login" className="inline-block text-sm text-cyan-400 hover:text-cyan-300">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <Field
              label="Full name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
              placeholder="Your full name"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
              placeholder="you@email.com"
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              required
              placeholder="At least 8 characters"
            />
            <Field
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              required
              placeholder="Repeat your password"
            />
            <Field
              label="Country (optional)"
              value={form.country}
              onChange={(v) => setForm({ ...form, country: v })}
              placeholder="Your country"
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}

        {!needsConfirmation && (
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </p>
        )}
      </Card>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={type === "password" ? 8 : undefined}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
      />
    </div>
  );
}
