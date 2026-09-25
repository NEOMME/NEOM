"use client";

import { Card } from "@/components/ui/Card";
import { BookOpen, ClipboardList, Globe, Headphones, Shield, Timer } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Guided Applications",
    description: "A structured six-step process keeps every requirement clear from start to finish.",
  },
  {
    icon: Globe,
    title: "Global Universities",
    description: "Browse partner institutions across multiple countries, programs, and deadlines.",
  },
  {
    icon: BookOpen,
    title: "Program Discovery",
    description: "Filter universities by field, country, and category to find the right fit.",
  },
  {
    icon: Headphones,
    title: "Application Support",
    description: "Get answers about requirements, documents, and deadlines whenever you need help.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your personal information is protected with industry-standard security practices.",
  },
  {
    icon: Timer,
    title: "Status Tracking",
    description: "Follow your application progress from submission through review.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why students choose Neom</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to research universities and submit a complete application — in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <div className="inline-flex p-3 rounded-lg bg-blue-50 text-blue-700 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
