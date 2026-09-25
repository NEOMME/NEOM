"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { Headphones, Loader2, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  onClose?: () => void;
  placeholder?: string;
  suggestions?: string[];
}

export function ChatPanel({
  title,
  subtitle,
  messages,
  onSend,
  onClose,
  placeholder = "Ask a question...",
  suggestions = [],
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    try {
      await onSend(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-700">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 neom-scrollbar min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Headphones className="w-10 h-10 mx-auto mb-3 text-blue-700" />
            <p className="text-slate-600 text-sm mb-4">How can we help you today?</p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === "user" ? "bg-slate-200" : "bg-blue-700"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-slate-600" />
              ) : (
                <Headphones className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-800 border border-slate-200"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-700">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-xl px-4 py-3 border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="md">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
