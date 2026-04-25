"use client";

import { useState } from "react";
import { Map, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";

interface MindMapNode {
  id: string;
  label: string;
  color: string;
  children: { id: string; label: string }[];
}

interface MindMapData {
  central: string;
  branches: MindMapNode[];
}

export default function MindMapPanel() {
  const [mindmap, setMindmap] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generateMindMap = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent: getAllContent() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMindmap(data.mindmap);
      toast.success("Mind map generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate positions for branches in a circle
  const getBranchPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Mind Map</span>
        </div>
        <Button
          onClick={generateMindMap}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" />Generating...</>
            : <><Sparkles className="w-3 h-3" />{mindmap ? "Regenerate" : "Generate"}</>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4" style={{ minHeight: 0 }}>
        {/* Empty state */}
        {!mindmap && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
              <Map className="w-7 h-7 text-cyan-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No mind map yet</p>
            <p className="text-xs text-slate-400 mb-4">
              {hasDocuments ? "Generate a visual mind map" : "Upload a document first"}
            </p>
            {hasDocuments && (
              <Button onClick={generateMindMap} size="sm" className="gradient-brand text-white rounded-xl gap-2 text-xs">
                <Sparkles className="w-3 h-3" /> Generate Mind Map
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-glow animate-pulse-slow">
              <Map className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-600">Building mind map...</p>
          </div>
        )}

        {/* Mind Map SVG */}
        {mindmap && !isLoading && (
          <div className="animate-fade-in">
            {/* Central topic */}
            <div className="text-center mb-6">
              <div className="inline-block gradient-brand text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-glow">
                {mindmap.central}
              </div>
            </div>

            {/* Branches as cards */}
            <div className="grid grid-cols-2 gap-3">
              {mindmap.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden"
                >
                  {/* Branch header */}
                  <div
                    className="px-4 py-2.5 text-white text-xs font-bold"
                    style={{ backgroundColor: branch.color }}
                  >
                    {branch.label}
                  </div>

                  {/* Children */}
                  <div className="p-3 space-y-1.5">
                    {branch.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: branch.color }}
                        />
                        {child.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}