"use client";

import { AdminPageHeader } from "@/components/admin/admin-ui";
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
    [adminChat, addAdminMessage]
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col min-h-[calc(100vh-8rem)]">
      <AdminPageHeader
        title="Admin AI"
        description="Ask about applications, platform stats, research, or draft student emails."
      />
      <div className="flex-1 min-h-[420px]">
        <ChatPanel
          title="Operations assistant"
          subtitle="Powered by your configured LLM"
          messages={adminChat}
          onSend={handleSend}
          placeholder="Ask about applications, stats, or draft an email…"
          suggestions={[
            "Show platform stats",
            "List all submitted applications with student emails",
            "Show pending research staging",
            "Research top engineering universities in Germany",
          ]}
        />
      </div>
    </div>
  );
}
