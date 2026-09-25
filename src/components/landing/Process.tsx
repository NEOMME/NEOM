"use client";

import { APPLICATION_STEPS } from "@/lib/data";

export function Process() {
  return (
    <section id="process" className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Your application journey</h2>
          <p className="text-slate-600">
            Each step is explained clearly so you always know what to do next.
          </p>
        </div>

        <div className="space-y-4">
          {APPLICATION_STEPS.map((step, i) => (
            <div
              key={step.id}
              className="flex gap-4 items-start bg-slate-50 rounded-xl border border-slate-200 p-5"
            >
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
