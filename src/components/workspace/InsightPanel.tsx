"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Sparkles, AlertTriangle, TrendingUp, Link2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Insight {
  patterns: { title: string; description: string; confidence: number }[];
  contradictions: { title: string; description: string; severity: "high" | "medium" | "low" }[];
  keyInsights: { title: string; description: string; type: "opportunity" | "risk" | "fact" | "trend" }[];
  hiddenConnections: { concept1: string; concept2: string; connection: string }[];
}

const severityColors = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const insightTypeColors = {
  opportunity: "bg-emerald-100 text-emerald-700 border-emerald-200",
  risk:        "bg-red-100 text-red-700 border-red-200",
  fact:        "bg-blue-100 text-blue-700 border-blue-200",
  trend:       "bg-purple-100 text-purple-700 border-purple-200",
};

export default function InsightPanel() {
  const [insights, setInsights] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generate = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent: getAllContent() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights);
      toast.success("Insights generated!");
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
          <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-pink-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Insight Mode</span>
          <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-600 border-pink-200">AI</Badge>
        </div>
        <Button
          onClick={generate}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" />Analyzing...</>
            : <><Sparkles className="w-3 h-3" />{insights ? "Re-analyze" : "Analyze"}</>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
        {/* Empty state */}
        {!insights && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
              <Lightbulb className="w-7 h-7 text-pink-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No insights yet</p>
            <p className="text-xs text-slate-400 mb-4">
              {hasDocuments ? "Discover hidden patterns and contradictions" : "Upload a document first"}
            </p>
            {hasDocuments && (
              <Button onClick={generate} size="sm" className="gradient-brand text-white rounded-xl gap-2 text-xs">
                <Sparkles className="w-3 h-3" /> Analyze Document
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center animate-pulse">
              <Lightbulb className="w-7 h-7 text-pink-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Analyzing patterns...</p>
            <p className="text-xs text-slate-400">Finding hidden connections</p>
          </div>
        )}

        {/* Insights */}
        {insights && !isLoading && (
          <div className="space-y-5 animate-fade-in">

            {/* Key Insights */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Key Insights</p>
              </div>
              <div className="space-y-2">
                {insights.keyInsights?.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-surface-200 p-3 shadow-card">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", insightTypeColors[item.type])}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Patterns</p>
              </div>
              <div className="space-y-2">
                {insights.patterns?.map((item, i) => (
                  <div key={i} className="bg-violet-50 rounded-xl border border-violet-200 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-violet-900">{item.title}</p>
                      <span className="text-[10px] text-violet-500 font-medium">{item.confidence}% confidence</span>
                    </div>
                    <div className="w-full bg-violet-200 rounded-full h-1 mb-2">
                      <div className="bg-violet-500 h-1 rounded-full" style={{ width: `${item.confidence}%` }} />
                    </div>
                    <p className="text-xs text-violet-700 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contradictions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contradictions</p>
              </div>
              <div className="space-y-2">
                {insights.contradictions?.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-surface-200 p-3 shadow-card">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", severityColors[item.severity])}>
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Connections */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-cyan-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Hidden Connections</p>
              </div>
              <div className="space-y-2">
                {insights.hiddenConnections?.map((item, i) => (
                  <div key={i} className="bg-cyan-50 rounded-xl border border-cyan-200 p-3">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-lg">{item.concept1}</span>
                      <Link2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-lg">{item.concept2}</span>
                    </div>
                    <p className="text-xs text-cyan-700 leading-relaxed">{item.connection}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regenerate */}
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl gap-2 text-xs border-surface-200"
              onClick={generate}
            >
              <RefreshCw className="w-3 h-3" /> Re-analyze
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}