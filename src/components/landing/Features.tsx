"use client";

import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Bot, Globe, Layers, Shield, Sparkles, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Guidance",
    description: "Our AI assistant understands your goals and guides you through every step with personalized recommendations.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Globe,
    title: "Global Universities",
    description: "Choose from partner universities across 8+ countries. Filter by category, program, and deadline.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Layers,
    title: "6-Step Process",
    description: "Clear, structured application flow. Profile → Destination → Academic → Programs → Documents → Review.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Sparkles,
    title: "Smart Matching",
    description: "AI analyzes your academic profile and suggests the best-fit universities and programs for you.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents and personal data are encrypted and handled with the highest security standards.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    description: "Track your application status in real time. Get notified at every milestone in the process.",
    color: "from-indigo-500 to-blue-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient">Neom</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We provide very clear and specific details at every stage.
            Our process is designed to be smooth, transparent, and stress-free.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:glow-cyan group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
