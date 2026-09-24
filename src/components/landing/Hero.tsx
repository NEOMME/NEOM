"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-cyan-400 mb-6">
            <Sparkles className="w-4 h-4" />
            NEMP — AI-Powered University Applications
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Future,
            <br />
            <span className="text-gradient">Guided by AI</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Neom provides a clear, smooth path to world-class universities.
            Our AI assistant helps you discover programs, understand requirements,
            and complete your application — step by step.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/student/apply">
              <Button size="lg">
                Start Your Application
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/student">
              <Button variant="secondary" size="lg">
                <Bot className="w-5 h-5" />
                Talk to AI Assistant
              </Button>
            </Link>
          </div>

          <div className="flex gap-8">
            {[
              { value: "8+", label: "Countries" },
              { value: "8", label: "Universities" },
              { value: "6", label: "Simple Steps" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="glass rounded-3xl p-8 glow-cyan animate-float">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Application Progress</h3>
                <p className="text-xs text-slate-400">Step 3 of 6 — Academic Info</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { step: "Profile", done: true },
                { step: "Destination", done: true },
                { step: "Academic", done: false, active: true },
                { step: "Programs", done: false },
                { step: "Documents", done: false },
                { step: "Review", done: false },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      s.done
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : s.active
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 glow-cyan"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {s.done ? "✓" : s.step[0]}
                  </div>
                  <span className={`text-sm ${s.active ? "text-cyan-400 font-medium" : s.done ? "text-slate-400" : "text-slate-600"}`}>
                    {s.step}
                  </span>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-4 border border-cyan-500/20">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  &ldquo;Based on your profile, I recommend MIT and TU Munich for Engineering programs. Shall I help you compare them?&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
