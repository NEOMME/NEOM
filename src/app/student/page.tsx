"use client";

import { ChatPanel } from "@/components/ai/ChatPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { APPLICATION_STEPS } from "@/lib/data";
import { useNeomStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

export default function StudentDashboard() {
  const {
    currentStudent,
    applications,
    universities,
    countries,
    studentChat,
    addStudentMessage,
  } = useNeomStore();

  const myApps = applications.filter(
    (a) => a.studentId === currentStudent?.id
  );

  const handleSend = useCallback(
    async (message: string) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      addStudentMessage(userMsg);

      const history = studentChat.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response ?? "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
      };
      addStudentMessage(assistantMsg);
    },
    [studentChat, addStudentMessage]
  );

  return (
    <div className="p-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {currentStudent?.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="text-slate-400">
          Your AI-powered application hub. Track progress and get guidance anytime.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: FileText,
            label: "Applications",
            value: myApps.length,
            color: "text-cyan-400",
          },
          {
            icon: GraduationCap,
            label: "Universities",
            value: universities.filter((u) => u.published).length,
            color: "text-violet-400",
          },
          {
            icon: Clock,
            label: "Pending Steps",
            value: myApps.reduce(
              (acc, a) => acc + a.steps.filter((s) => !s.completed).length,
              0
            ),
            color: "text-amber-400",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl glass">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Your Applications</h2>
              <Link href="/student/apply">
                <Button size="sm">
                  New Application
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {myApps.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No applications yet</p>
                <Link href="/student/apply">
                  <Button>Start Your First Application</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApps.map((app) => {
                  const completedSteps = app.steps.filter((s) => s.completed).length;
                  const progress = (completedSteps / app.steps.length) * 100;

                  return (
                    <div
                      key={app.id}
                      className="glass rounded-xl p-5 hover:border-cyan-500/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">{app.universityName}</h3>
                          <p className="text-sm text-slate-400">{app.countryName}</p>
                        </div>
                        <Badge label={app.status.replace("_", " ")} status={app.status} />
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{completedSteps}/{app.steps.length} steps</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">
                        Updated {formatDate(app.updatedAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Application Steps</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {APPLICATION_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-xl glass"
                >
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
          </Card>
        </div>

        <div id="ai" className="lg:col-span-2">
          <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <ChatPanel
              title="Neom AI Assistant"
              subtitle="Powered by Groq / DeepSeek"
              messages={studentChat}
              onSend={handleSend}
              accent="cyan"
              suggestions={[
                "What universities do you offer?",
                "Explain the application process",
                "Which countries can I apply to?",
                "Help me choose a program",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
