"use client";

import { Button } from "@/components/ui/Button";
import { APPLICATION_STEPS } from "@/lib/data";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-28 pb-20 px-6 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-medium text-blue-700 mb-4">
            Neom Educational Mobility Platform
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 mb-6">
            Apply to world-class universities with confidence
          </h1>

          <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
            Neom gives you a clear path from profile to submission. Explore partner
            universities, understand requirements, and complete your application step by step.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link href="/signup">
              <Button size="lg">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex gap-10">
            {[
              { value: "8+", label: "Countries" },
              { value: "8", label: "Universities" },
              { value: "6", label: "Application steps" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <h3 className="font-semibold text-slate-900 mb-1">How it works</h3>
          <p className="text-sm text-slate-500 mb-6">Six clear steps to submit your application</p>

          <div className="space-y-4">
            {APPLICATION_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Free to create an account and start applying
          </div>
        </div>
      </div>
    </section>
  );
}
