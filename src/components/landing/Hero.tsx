"use client";

import { Button } from "@/components/ui/Button";
import { APPLICATION_STEPS } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
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
            <Link href="/signup">
              <Button size="lg">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
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
          <div className="glass rounded-3xl p-8 glow-cyan">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">How it works</h3>
                <p className="text-xs text-slate-400">A clear 6-step application process</p>
              </div>
            </div>

            <div className="space-y-3">
              {APPLICATION_STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
