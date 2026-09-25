"use client";

import { ChatPanel } from "@/components/ai/ChatPanel";
import { useAdminStore } from "@/lib/admin-store";
import { useCallback } from "react";

export default function AdminAIPage() {
  const { adminChat, addAdminMessage } = useAdminStore();

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
      addAdminMessage({
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response ?? "Sorry, I couldn't process that.",
        timestamp: new Date().toISOString(),
      });
    },
    [adminChat, addAdminMessage]
  );

  return (
    <div className="p-8 h-[calc(100vh-2rem)] max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Admin AI</h1>
      <p className="text-slate-400 mb-6">
        Operations assistant — review applications, check stats, draft emails, manage research.
      </p>
      <div className="h-[calc(100%-6rem)]">
        <ChatPanel
          title="Admin AI"
          subtitle="Platform operations assistant"
          messages={adminChat}
          onSend={handleSend}
          placeholder="Ask about applications, stats, or draft an email..."
          suggestions={[
            "Show platform stats",
            "List submitted applications",
            "Show pending research",
            "Draft a welcome email for new students",
          ]}
        />
      </div>
    </div>
  );
}
