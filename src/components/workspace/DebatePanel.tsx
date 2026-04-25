"use client";

import { useState } from "react";
import { Swords, Loader2, Sparkles, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DebateRound {
  round: number;
  agentA: string;
  agentB: string;
}

interface DebateData {
  topic: string;
  agentA: { name: string; stance: string };
  agentB: { name: string; stance: string };
  rounds: DebateRound[];
  verdict: string;
  keyTakeaway: string;
}

export default function DebatePanel() {
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generate = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent: getAllContent(), topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDebate(data.debate);
      toast.success("Debate generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <Swords className="w-3.5 h-3.5 text-red-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Debate Mode</span>
          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">AI</Badge>
        </div>
        <Button
          onClick={generate}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" />Debating...</>
            : <><Sparkles className="w-3 h-3" />{debate ? "New Debate" : "Start Debate"}</>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
        {/* Topic input */}
        {!debate && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
              <Swords className="w-7 h-7 text-red-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Two AI agents will debate</p>
              <p className="text-xs text-slate-400">
                {hasDocuments ? "Enter a topic or leave blank for auto-detect" : "Upload a document first"}
              </p>
            </div>
            {hasDocuments && (
              <div className="w-full max-w-sm space-y-2">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Debate topic (optional — auto-detected)"
                  className="rounded-xl text-sm bg-white border-surface-200 focus-visible:ring-brand-400 h-9"
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                />
                <Button onClick={generate} className="w-full gradient-brand text-white rounded-xl gap-2 text-sm">
                  <Swords className="w-4 h-4" /> Start Debate
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center animate-pulse">
              <Swords className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Agents are debating...</p>
            <p className="text-xs text-slate-400">Preparing arguments from your document</p>
          </div>
        )}

        {/* Debate */}
        {debate && !isLoading && (
          <div className="space-y-4 animate-fade-in">
            {/* Topic */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Debate Topic</p>
              <p className="text-sm font-bold">{debate.topic}</p>
            </div>

            {/* Agents */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">A</div>
                <p className="text-xs font-bold text-blue-900 mb-1">{debate.agentA.name}</p>
                <p className="text-[11px] text-blue-700 leading-relaxed">{debate.agentA.stance}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">B</div>
                <p className="text-xs font-bold text-orange-900 mb-1">{debate.agentB.name}</p>
                <p className="text-[11px] text-orange-700 leading-relaxed">{debate.agentB.stance}</p>
              </div>
            </div>

            {/* Rounds */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-1">Debate Rounds</p>
              {debate.rounds.map((round) => (
                <div key={round.round} className="space-y-2">
                  <p className="text-[10px] text-slate-400 font-medium px-1">Round {round.round}</p>
                  {/* Agent A */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">A</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tl-sm px-3 py-2.5 flex-1">
                      <p className="text-xs text-blue-900 leading-relaxed">{round.agentA}</p>
                    </div>
                  </div>
                  {/* Agent B */}
                  <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">B</div>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl rounded-tr-sm px-3 py-2.5 flex-1">
                      <p className="text-xs text-orange-900 leading-relaxed">{round.agentB}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Verdict</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{debate.verdict}</p>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest mb-1">Key Takeaway</p>
                <p className="text-xs text-brand-800 leading-relaxed">{debate.keyTakeaway}</p>
              </div>
            </div>

            {/* New debate */}
            <div className="space-y-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="New topic to debate..."
                className="rounded-xl text-sm bg-white border-surface-200 focus-visible:ring-brand-400 h-9"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl gap-2 text-xs border-surface-200"
                onClick={generate}
              >
                <RefreshCw className="w-3 h-3" /> New Debate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}