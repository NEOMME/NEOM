"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  onClose?: () => void;
  placeholder?: string;
  accent?: "cyan" | "purple";
  suggestions?: string[];
}

export function ChatPanel({
  title,
  subtitle,
  messages,
  onSend,
  onClose,
  placeholder = "Ask anything...",
  accent = "cyan",
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

  const accentClass = accent === "purple" ? "from-violet-500 to-purple-600" : "from-cyan-500 to-blue-600";

  return (
    <div className="flex flex-col h-full glass-strong rounded-2xl overflow-hidden">
      <div className={cn("flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r", accentClass, "bg-opacity-10")}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl bg-gradient-to-br", accentClass)}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 neom-scrollbar min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className={cn("w-12 h-12 mx-auto mb-3", accent === "purple" ? "text-violet-400" : "text-cyan-400")} />
            <p className="text-slate-400 text-sm mb-4">How can I help you today?</p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full glass hover:border-cyan-500/40 text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-slate-700" : cn("bg-gradient-to-br", accentClass)
                )}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-slate-300" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-cyan-500/20 text-cyan-50 border border-cyan-500/20"
                    : "glass text-slate-200"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", accentClass)}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="md">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
