"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Trash2, BookOpen,
  GraduationCap, Loader2, FileText, Zap, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const explainModes = [
  { id: "simple" as const, label: "ELI5",   icon: BookOpen,      color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "normal" as const, label: "Normal", icon: Bot,           color: "text-brand-600 bg-brand-50 border-brand-200" },
  { id: "expert" as const, label: "Expert", icon: GraduationCap, color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const suggestions = [
  "Summarize the key points",
  "What are the main topics?",
  "Explain the most important concept",
  "What conclusions are drawn?",
];

function MessageBubble({ message }: { message: { role: string; content: string; isLoading?: boolean } }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "gradient-brand" : "bg-surface-100 border border-surface-200"
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-500" />}
      </div>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "gradient-brand text-white rounded-tr-sm"
          : "bg-white border border-surface-200 text-slate-800 rounded-tl-sm shadow-card"
      )}>
        {message.isLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Thinking...</span>
          </div>
        ) : isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-slate">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, explainMode, addMessage, updateLastMessage, setLoading, setExplainMode, clearMessages } = useChatStore();
  const { documents, getAllContent } = useDocumentStore();
  const readyDocs = documents.filter((d) => d.status === "ready");
  const hasDocuments = readyDocs.length > 0;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || isLoading) return;
    if (!hasDocuments) { toast.error("Please upload a document first!"); return; }

    addMessage({ id: Date.now().toString(), role: "user", content: messageText, timestamp: new Date() });
    addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date(), isLoading: true });
    setInput("");
    setLoading(true);

    try {
      const documentContent = getAllContent();
      const history = messages.filter((m) => !m.isLoading).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, documentContent, history, explainMode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get response");
      updateLastMessage(data.response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      updateLastMessage(`❌ Error: ${msg}`);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-surface-50" style={{ height: "100%" }}>
      
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-800">AI Chat</span>
          {hasDocuments && (
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">
              {readyDocs.length} doc{readyDocs.length > 1 ? "s" : ""} loaded
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-100 rounded-xl p-1 gap-1">
            {explainModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setExplainMode(mode.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                    explainMode === mode.id ? mode.color + " border shadow-card" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className="w-3 h-3" />{mode.label}
                </button>
              );
            })}
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500" onClick={clearMessages}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages — native div scroll instead of ScrollArea */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {!hasDocuments ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">No documents uploaded</p>
                <p className="text-xs text-slate-400">Upload a document in the sidebar to start chatting</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-4 shadow-glow">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Ready to chat!</p>
                <p className="text-xs text-slate-400 mb-6">Ask anything about your documents</p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-xs bg-white border border-surface-200 rounded-xl px-3 py-2.5 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:shadow-card transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-surface-200 p-4 shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={hasDocuments ? "Ask anything about your documents..." : "Upload a document first..."}
            disabled={!hasDocuments || isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl border-surface-200 bg-surface-50 text-sm focus-visible:ring-brand-400 min-h-[44px] max-h-32"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || !hasDocuments || isLoading}
            className="gradient-brand text-white rounded-xl w-11 h-11 p-0 shrink-0 shadow-card hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Shift+Enter for new line · Enter to send · Powered by Groq
        </p>
      </div>
    </div>
  );
}