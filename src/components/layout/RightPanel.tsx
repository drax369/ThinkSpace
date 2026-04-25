"use client";

import { useState } from "react";
import {
  Lightbulb,
  StickyNote,
  X,
  Plus,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ── Placeholder insights ──────────────────────────────────────────────
const sampleInsights = [
  {
    type: "pattern",
    text: "Recurring theme of decentralization across all uploaded documents.",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    dot: "bg-violet-400",
  },
  {
    type: "contradiction",
    text: "Doc 1 claims X increases performance; Doc 2 shows the opposite.",
    color: "bg-red-50 border-red-200 text-red-800",
    dot: "bg-red-400",
  },
  {
    type: "key",
    text: "Three documents emphasize the 80/20 principle as critical.",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    dot: "bg-amber-400",
  },
];

// ── Placeholder notes ─────────────────────────────────────────────────
const sampleNotes = [
  { id: 1, text: "Review section 3 before the exam.", time: "2m ago" },
  { id: 2, text: "The contradiction on page 12 is important.", time: "1h ago" },
];

export default function RightPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState(sampleNotes);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      { id: Date.now(), text: newNote.trim(), time: "just now" },
      ...prev,
    ]);
    setNewNote("");
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center pt-4 w-10 bg-white border-l border-surface-200 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-xl"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Button>
        <Lightbulb className="w-4 h-4 text-slate-300" />
        <StickyNote className="w-4 h-4 text-slate-300" />
      </div>
    );
  }

  return (
    <aside className="w-[280px] bg-white border-l border-surface-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200">
        <span className="text-sm font-semibold text-slate-800">Workspace</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-lg"
          onClick={() => setCollapsed(true)}
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="insights" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-3 mb-0 rounded-xl bg-surface-100 p-1 grid grid-cols-2">
          <TabsTrigger value="insights" className="rounded-lg text-xs">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg text-xs">
            <StickyNote className="w-3 h-3 mr-1.5" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* ── Insights tab ── */}
        <TabsContent value="insights" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full px-3 py-3">
            <div className="space-y-2.5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 px-1">
                Auto-detected
              </p>
              {sampleInsights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border p-3 text-xs leading-relaxed",
                    insight.color
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1 shrink-0",
                        insight.dot
                      )}
                    />
                    {insight.text}
                  </div>
                </div>
              ))}

              {/* Empty state when no docs uploaded */}
              <div className="mt-6 text-center py-6">
                <Lightbulb className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  Upload documents to unlock AI insights
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Notes tab ── */}
        <TabsContent value="notes" className="flex-1 overflow-hidden flex flex-col mt-0">
          {/* Add note input */}
          <div className="px-3 pt-3 pb-2 border-b border-surface-100">
            <div className="flex gap-1.5">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Quick note..."
                className="flex-1 text-xs bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 transition-all"
              />
              <Button
                size="icon"
                className="w-8 h-8 rounded-lg gradient-brand text-white shrink-0"
                onClick={addNote}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Notes list */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-3 group"
                >
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {note.text}
                  </p>
                  <p className="text-[10px] text-amber-400 mt-1.5">
                    {note.time}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}