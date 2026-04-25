"use client";

import { useState } from "react";
import {
  FileText, Loader2, Sparkles, Clock,
  ChevronDown, ChevronUp, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Summary {
  title: string;
  overview: string;
  keyPoints: string[];
  sections: { heading: string; content: string }[];
  conclusion: string;
  readingTime: number;
}

export default function SummaryPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generateSummary = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent: getAllContent() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
      toast.success("Summary generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (i: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">AI Summary</span>
        </div>
        <Button
          onClick={generateSummary}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading ? (
            <><Loader2 className="w-3 h-3 animate-spin" />Generating...</>
          ) : (
            <><Sparkles className="w-3 h-3" />Generate</>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        {!summary && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-violet-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No summary yet</p>
            <p className="text-xs text-slate-400 mb-4">
              {hasDocuments ? "Click Generate to create a summary" : "Upload a document first"}
            </p>
            {hasDocuments && (
              <Button onClick={generateSummary} size="sm" className="gradient-brand text-white rounded-xl gap-2 text-xs">
                <Sparkles className="w-3 h-3" /> Generate Summary
              </Button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-glow animate-pulse-slow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-600">Analyzing document...</p>
            <p className="text-xs text-slate-400">This may take a few seconds</p>
          </div>
        )}

        {summary && (
          <div className="space-y-4 animate-fade-in">
            {/* Title + reading time */}
            <div className="bg-white rounded-2xl border border-surface-200 p-4 shadow-card">
              <h2 className="text-base font-bold text-slate-900 mb-2">{summary.title}</h2>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{summary.readingTime} min read</span>
              </div>
            </div>

            {/* Overview */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Overview</p>
              <p className="text-sm text-brand-900 leading-relaxed">{summary.overview}</p>
            </div>

            {/* Key Points */}
            <div className="bg-white rounded-2xl border border-surface-200 p-4 shadow-card">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Key Points</p>
              <div className="space-y-2">
                {summary.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-1">Sections</p>
              {summary.sections.map((section, i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
                  <button
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{section.heading}</span>
                    {expandedSections.has(i)
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </button>
                  {expandedSections.has(i) && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conclusion */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-2">Conclusion</p>
              <p className="text-sm text-emerald-900 leading-relaxed">{summary.conclusion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}