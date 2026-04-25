"use client";

import { useState } from "react";
import { CreditCard, Loader2, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

const difficultyColors = {
  easy:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard:   "bg-red-100 text-red-700 border-red-200",
};

export default function FlashcardsPanel() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generateFlashcards = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());

    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent: getAllContent() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFlashcards(data.flashcards);
      toast.success(`${data.flashcards.length} flashcards generated!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const current = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  const markKnown = () => {
    setKnown((prev) => new Set([...prev, current.id]));
    setUnknown((prev) => { const n = new Set(prev); n.delete(current.id); return n; });
    if (currentIndex < flashcards.length - 1) { setCurrentIndex((i) => i + 1); setIsFlipped(false); }
  };

  const markUnknown = () => {
    setUnknown((prev) => new Set([...prev, current.id]));
    setKnown((prev) => { const n = new Set(prev); n.delete(current.id); return n; });
    if (currentIndex < flashcards.length - 1) { setCurrentIndex((i) => i + 1); setIsFlipped(false); }
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Flashcards</span>
          {flashcards.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {currentIndex + 1}/{flashcards.length}
            </Badge>
          )}
        </div>
        <Button
          onClick={generateFlashcards}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" />Generating...</>
            : <><Sparkles className="w-3 h-3" />{flashcards.length > 0 ? "Regenerate" : "Generate"}</>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col" style={{ minHeight: 0 }}>
        {/* Empty state */}
        {flashcards.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-amber-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No flashcards yet</p>
            <p className="text-xs text-slate-400 mb-4">
              {hasDocuments ? "Generate flashcards from your document" : "Upload a document first"}
            </p>
            {hasDocuments && (
              <Button onClick={generateFlashcards} size="sm" className="gradient-brand text-white rounded-xl gap-2 text-xs">
                <Sparkles className="w-3 h-3" /> Generate Flashcards
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-glow animate-pulse-slow">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-600">Creating flashcards...</p>
          </div>
        )}

        {/* Flashcard */}
        {current && !isLoading && (
          <div className="flex flex-col items-center gap-4">
            {/* Progress bar */}
            <div className="w-full bg-surface-200 rounded-full h-1.5">
              <div
                className="gradient-brand h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex gap-3 w-full justify-center">
              <span className="text-xs text-emerald-600 font-medium">✓ {known.size} known</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-red-500 font-medium">✗ {unknown.size} learning</span>
            </div>

            {/* Card */}
            <div
              className="w-full cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "200px",
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl border border-surface-200 shadow-card-md p-6 flex flex-col items-center justify-center text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Badge variant="outline" className={cn("text-[10px] mb-3", difficultyColors[current.difficulty])}>
                    {current.difficulty}
                  </Badge>
                  <p className="text-sm font-medium text-slate-500 mb-2">Question</p>
                  <p className="text-base font-semibold text-slate-900">{current.front}</p>
                  <p className="text-xs text-slate-400 mt-4">Tap to reveal answer</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-brand-500 rounded-2xl shadow-card-md p-6 flex flex-col items-center justify-center text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-sm font-medium text-brand-200 mb-2">Answer</p>
                  <p className="text-base font-semibold text-white">{current.back}</p>
                  <p className="text-xs text-brand-300 mt-4">
                    Category: {current.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl w-10 h-10 border-surface-200"
                onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setIsFlipped(false); }}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {isFlipped && (
                <>
                  <Button
                    onClick={markUnknown}
                    className="rounded-xl gap-2 text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    variant="outline"
                  >
                    <X className="w-4 h-4" /> Still learning
                  </Button>
                  <Button
                    onClick={markKnown}
                    className="rounded-xl gap-2 text-sm bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                    variant="outline"
                  >
                    <Check className="w-4 h-4" /> Got it!
                  </Button>
                </>
              )}

              {!isFlipped && (
                <Button
                  onClick={() => setIsFlipped(true)}
                  className="gradient-brand text-white rounded-xl px-6 text-sm"
                >
                  Reveal Answer
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl w-10 h-10 border-surface-200"
                onClick={() => { setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1)); setIsFlipped(false); }}
                disabled={currentIndex === flashcards.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Restart */}
            {currentIndex === flashcards.length - 1 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 text-xs border-surface-200"
                onClick={() => { setCurrentIndex(0); setIsFlipped(false); setKnown(new Set()); setUnknown(new Set()); }}
              >
                <RotateCcw className="w-3 h-3" /> Start over
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}