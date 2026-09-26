"use client";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { useAdminStore } from "@/lib/admin-store";
import { useCallback, useEffect } from "react";

export default function AdminAIPage() {
  const { adminChat, adminAiStatus, addAdminMessage, setAdminAiStatus, clearAdminChat, hydrate, hydrated } =
    useAdminStore();

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const handleSend = useCallback(
    async (message: string) => {
      const userMsg = {
        id: `msg-${Date.now()}`,
        role: "user" as const,
        content: message,
        timestamp: new Date().toISOString(),
      };
      addAdminMessage(userMsg);

      const history = adminChat.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      const data = await res.json();
      if (data.aiStatus) {
        setAdminAiStatus({
          configured: data.aiStatus.configured,
          label: data.aiStatus.label,
          provider: data.aiStatus.provider ?? null,
        });
      }
      const text =
        (typeof data.response === "string" && data.response.trim()) ||
        (typeof data.error === "string" && data.error) ||
        (res.ok ? "" : `Request failed (${res.status}).`);
      addAdminMessage({
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: text || "Sorry, I couldn't process that. Try “Show platform stats” or check LLM settings.",
        timestamp: new Date().toISOString(),
      });
    },
    [adminChat, addAdminMessage, setAdminAiStatus]
  );

  const aiSubtitle = adminAiStatus?.configured
    ? `Connected: ${adminAiStatus.label} · Lists/stats work from live data even if the LLM is slow`
    : "Data-only mode — set DEEPSEEK_API_KEY on Railway for full tool actions";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col min-h-[calc(100vh-8rem)]">
      <AdminPageHeader
        title="Admin AI"
        description="This is the admin operations assistant (not the student Application Copilot). It uses /api/ai/admin with your platform database."
      />
      <div className="flex items-center justify-between gap-3 mb-3 text-xs text-slate-600">
        <span>
          {adminAiStatus?.configured ? (
            <>LLM: <strong className="text-slate-800">{adminAiStatus.label}</strong></>
          ) : (
            <>No LLM env detected — try &quot;Show platform stats&quot; or &quot;List submitted applications&quot; anyway.</>
          )}
        </span>
        {adminChat.length > 0 && (
          <button
            type="button"
            onClick={() => void clearAdminChat()}
            className="text-blue-700 hover:underline shrink-0"
          >
            Clear chat history
          </button>
        )}
      </div>
      <div className="flex-1 min-h-[420px]">
        <ChatPanel
          title="Admin operations assistant"
          subtitle={aiSubtitle}
          messages={adminChat}
          onSend={handleSend}
          placeholder="Ask about applications, stats, or draft an email…"
          suggestions={[
            "Show platform stats",
            "List all submitted applications with student emails",
            "Show pending research staging",
            "Research top engineering universities in Germany",
            "Mark the latest submitted application as under review",
            "List pending staging and approve the first one",
            "Add a new university in Canada with CS programs",
            "Delete rejected staging entries",
          ]}
        />
      </div>
    </div>
  );
}
