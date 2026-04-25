"use client";

import { useState } from "react";
import { GraduationCap, Loader2, Sparkles, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

const difficultyColors = {
  easy:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard:   "bg-red-100 text-red-700 border-red-200",
};

export default function ExamPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generate = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: getAllContent(),
          difficulty,
          previousWrong: wrongTopics,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      toast.success(`${data.questions.length} questions generated!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const current = questions[currentIndex];
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    if (optionIndex === current.correct) {
      setScore((s) => s + 1);
    } else {
      setWrongTopics((prev) => [...new Set([...prev, current.topic])]);
    }
  };

  const nextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
    setAnswers(new Array(questions.length).fill(null));
  };

  const current = questions[currentIndex];
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Exam Mode</span>
          <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">AI</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Difficulty selector */}
          <div className="flex items-center bg-surface-100 rounded-xl p-1 gap-1">
            {(["easy","medium","hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize",
                  difficulty === d
                    ? difficultyColors[d] + " border shadow-card"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <Button
            onClick={generate}
            disabled={isLoading || !hasDocuments}
            size="sm"
            className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
          >
            {isLoading
              ? <><Loader2 className="w-3 h-3 animate-spin" />Loading...</>
              : <><Sparkles className="w-3 h-3" />{questions.length > 0 ? "New Exam" : "Start Exam"}</>
            }
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        {/* Empty state */}
        {questions.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-orange-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Adaptive Exam Mode</p>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              {hasDocuments
                ? "AI generates questions based on your document. Gets harder where you struggle."
                : "Upload a document first"}
            </p>
            {hasDocuments && (
              <Button onClick={generate} className="gradient-brand text-white rounded-xl gap-2 text-sm">
                <GraduationCap className="w-4 h-4" /> Start Exam
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center animate-pulse">
              <GraduationCap className="w-7 h-7 text-orange-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Preparing your exam...</p>
          </div>
        )}

        {/* Results screen */}
        {finished && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-fade-in">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center shadow-glow",
              percent >= 70 ? "gradient-brand" : "bg-amber-100"
            )}>
              <Trophy className={cn("w-10 h-10", percent >= 70 ? "text-white" : "text-amber-500")} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{percent}%</p>
              <p className="text-sm text-slate-500 mt-1">
                {score} / {questions.length} correct
              </p>
            </div>
            <p className={cn(
              "text-sm font-medium px-4 py-2 rounded-xl",
              percent >= 80 ? "bg-emerald-50 text-emerald-700" :
              percent >= 60 ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-700"
            )}>
              {percent >= 80 ? "🎉 Excellent! You know this well." :
               percent >= 60 ? "👍 Good effort! Review weak areas." :
               "📚 Keep studying — you'll get there!"}
            </p>

            {wrongTopics.length > 0 && (
              <div className="bg-white border border-surface-200 rounded-2xl p-4 w-full max-w-sm shadow-card text-left">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Focus on these topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {wrongTopics.map((t, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={restart} variant="outline" className="rounded-xl gap-2 text-sm border-surface-200">
                <RotateCcw className="w-4 h-4" /> Retry Same
              </Button>
              <Button onClick={generate} className="gradient-brand text-white rounded-xl gap-2 text-sm">
                <Sparkles className="w-4 h-4" /> New Exam
              </Button>
            </div>
          </div>
        )}

        {/* Question */}
        {current && !isLoading && !finished && (
          <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Score: {score}/{currentIndex + (selectedAnswer !== null ? 1 : 0)}</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-1.5">
              <div
                className="gradient-brand h-1.5 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={cn("text-[10px]", difficultyColors[current.difficulty])}>
                  {current.difficulty}
                </Badge>
                <span className="text-[10px] text-slate-400">{current.topic}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">{current.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {current.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === current.correct;
                const showResult = selectedAnswer !== null;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      !showResult && "bg-white border-surface-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
                      showResult && isCorrect && "bg-emerald-50 border-emerald-400 text-emerald-800",
                      showResult && isSelected && !isCorrect && "bg-red-50 border-red-400 text-red-800",
                      showResult && !isSelected && !isCorrect && "bg-white border-surface-200 text-slate-400 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        !showResult && "bg-surface-100 text-slate-500",
                        showResult && isCorrect && "bg-emerald-500 text-white",
                        showResult && isSelected && !isCorrect && "bg-red-500 text-white",
                        showResult && !isSelected && !isCorrect && "bg-surface-100 text-slate-400"
                      )}>
                        {showResult && isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> :
                         showResult && isSelected && !isCorrect ? <XCircle className="w-3.5 h-3.5" /> :
                         String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={cn(
                "rounded-2xl border p-4 text-sm animate-slide-up",
                selectedAnswer === current.correct
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              )}>
                <p className={cn(
                  "font-semibold mb-1",
                  selectedAnswer === current.correct ? "text-emerald-700" : "text-red-700"
                )}>
                  {selectedAnswer === current.correct ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                <p className={cn(
                  "text-xs leading-relaxed",
                  selectedAnswer === current.correct ? "text-emerald-800" : "text-red-800"
                )}>
                  {current.explanation}
                </p>
              </div>
            )}

            {/* Next button */}
            {selectedAnswer !== null && (
              <Button
                onClick={nextQuestion}
                className="w-full gradient-brand text-white rounded-xl gap-2 animate-slide-up"
              >
                {currentIndex === questions.length - 1 ? "See Results" : "Next Question"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}