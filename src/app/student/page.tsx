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
  FileText,
  GraduationCap,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";

export default function StudentDashboard() {
  const {
    currentStudent,
    applications,
    universities,
    promotions,
    studentChat,
    addStudentMessage,
    loadStudentChat,
  } = useNeomStore();

  useEffect(() => {
    loadStudentChat();
  }, [loadStudentChat]);

  const myApps = applications.filter(
    (a) => a.studentId === currentStudent?.id
  );

  const drafts = myApps.filter((a) => a.status === "draft");

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
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Welcome back, {currentStudent?.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="text-slate-600">
          Track your applications and get AI-powered help anytime.
        </p>
      </motion.div>

      {promotions.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span className="text-sm font-medium text-blue-900">{promotions[0].title}</span>
          </div>
          <p className="text-sm text-blue-800">{promotions[0].description} — {promotions[0].discount}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {[
          { icon: FileText, label: "Applications", value: myApps.length, color: "text-blue-700" },
          { icon: GraduationCap, label: "Universities", value: universities.filter((u) => u.published).length, color: "text-teal-700" },
          { icon: Clock, label: "Drafts", value: drafts.length, color: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {drafts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Continue Draft</h2>
              {drafts.map((draft) => (
                <Link key={draft.id} href={`/student/apply?draft=${draft.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{draft.universityName || "Untitled draft"}</p>
                      <p className="text-xs text-slate-500">Last updated {formatDate(draft.updatedAt)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                  </div>
                </Link>
              ))}
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Your Applications</h2>
              <Link href="/student/apply">
                <Button size="sm">
                  New Application
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {myApps.filter((a) => a.status !== "draft").length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No submitted applications yet</p>
                <Link href="/student/apply">
                  <Button>Start Your First Application</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApps.filter((a) => a.status !== "draft").map((app) => {
                  const completedSteps = app.steps.filter((s) => s.completed).length;
                  const progress = app.steps.length ? (completedSteps / app.steps.length) * 100 : 0;

                  return (
                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">{app.universityName}</h3>
                          <p className="text-sm text-slate-500">{app.countryName}</p>
                        </div>
                        <Badge label={app.status.replace("_", " ")} status={app.status} />
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{completedSteps}/{app.steps.length} steps</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-700 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Updated {formatDate(app.updatedAt)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Application Steps</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {APPLICATION_STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div id="support" className="lg:col-span-2">
          <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <ChatPanel
              title="Neom AI Advisor"
              subtitle="Search universities, get recommendations, track applications"
              messages={studentChat}
              onSend={handleSend}
              suggestions={[
                "Recommend universities for my profile",
                "Which CS programs are under $20k?",
                "Show my applications",
                "Help me choose a program",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
