"use client";

import { APPLICATION_STEPS } from "@/lib/data";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function Process() {
  return (
    <section id="process" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            A Smooth <span className="text-gradient">6-Step Journey</span>
          </h2>
          <p className="text-slate-400">
            Every step is clearly explained. Our AI is with you from start to finish.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-violet-500/50 to-transparent" />

          <div className="space-y-8">
            {APPLICATION_STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 z-10 glass">
                  <span className="text-sm font-bold text-cyan-400">{i + 1}</span>
                </div>
                <div className="glass rounded-2xl p-5 flex-1 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    {i < 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
