"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Sparkles, Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudyTask {
  task: string;
  duration: string;
  type: "read" | "practice" | "review" | "test";
}

interface StudyDay {
  day: number;
  theme: string;
  tasks: StudyTask[];
  goal: string;
}

interface StudyPlan {
  title: string;
  totalDays: number;
  dailyHours: number;
  overview: string;
  days: StudyDay[];
  tips: string[];
  topics: { name: string; priority: "high" | "medium" | "low"; estimatedTime: string }[];
}

const taskTypeConfig = {
  read:     { color: "bg-blue-100 text-blue-700",    icon: BookOpen },
  practice: { color: "bg-brand-100 text-brand-700",  icon: CheckCircle },
  review:   { color: "bg-amber-100 text-amber-700",  icon: AlertCircle },
  test:     { color: "bg-red-100 text-red-700",      icon: CheckCircle },
};

const priorityColors = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function PlannerPanel() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examDate, setExamDate] = useState("7");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const generate = async () => {
    if (!hasDocuments) { toast.error("Upload a document first!"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: getAllContent(),
          examDate: `${examDate} days`,
          hoursPerDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data.plan);
      setExpandedDay(0);
      toast.success("Study plan created!");
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
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Study Planner</span>
          <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-600 border-teal-200">AI</Badge>
        </div>
        <Button
          onClick={generate}
          disabled={isLoading || !hasDocuments}
          size="sm"
          className="gradient-brand text-white rounded-xl gap-2 text-xs h-8"
        >
          {isLoading
            ? <><Loader2 className="w-3 h-3 animate-spin" />Planning...</>
            : <><Sparkles className="w-3 h-3" />{plan ? "Regenerate" : "Create Plan"}</>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
        {/* Config inputs */}
        {!plan && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-2">
              <CalendarDays className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Smart Study Planner</p>
              <p className="text-xs text-slate-400">
                {hasDocuments ? "Configure your study schedule" : "Upload a document first"}
              </p>
            </div>
            {hasDocuments && (
              <div className="w-full max-w-sm space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Days until exam</label>
                    <Input
                      type="number"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      min="1" max="30"
                      className="rounded-xl text-sm bg-white border-surface-200 h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Hours/day</label>
                    <Input
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(e.target.value)}
                      min="0.5" max="12" step="0.5"
                      className="rounded-xl text-sm bg-white border-surface-200 h-9"
                    />
                  </div>
                </div>
                <Button onClick={generate} className="w-full gradient-brand text-white rounded-xl gap-2 text-sm">
                  <CalendarDays className="w-4 h-4" /> Create Study Plan
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center animate-pulse">
              <CalendarDays className="w-7 h-7 text-teal-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Building your plan...</p>
            <p className="text-xs text-slate-400">Analyzing topics and priorities</p>
          </div>
        )}

        {/* Plan */}
        {plan && !isLoading && (
          <div className="space-y-4 animate-fade-in">
            {/* Overview card */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-teal-900 mb-1">{plan.title}</p>
              <p className="text-xs text-teal-700 leading-relaxed mb-3">{plan.overview}</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-1 text-xs text-teal-600">
                  <CalendarDays className="w-3 h-3" />
                  <span>{plan.totalDays} days</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-teal-600">
                  <Clock className="w-3 h-3" />
                  <span>{plan.dailyHours}h/day</span>
                </div>
              </div>
            </div>

            {/* Topics priority */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Topics by Priority</p>
              <div className="space-y-1.5">
                {plan.topics?.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-surface-200 px-3 py-2 shadow-card">
                    <span className="text-xs font-medium text-slate-700">{topic.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{topic.estimatedTime}</span>
                      <Badge variant="outline" className={cn("text-[10px]", priorityColors[topic.priority])}>
                        {topic.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily plan */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Daily Schedule</p>
              <div className="space-y-2">
                {plan.days?.map((day, i) => (
                  <div key={i} className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg gradient-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {day.day}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{day.theme}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{day.tasks.length} tasks</span>
                    </button>

                    {expandedDay === i && (
                      <div className="px-4 pb-3 space-y-2 border-t border-surface-100 pt-2">
                        {day.tasks.map((task, j) => {
                          const config = taskTypeConfig[task.type] ?? taskTypeConfig.read;
                          const Icon = config.icon;
                          return (
                            <div key={j} className="flex items-start gap-2">
                              <Icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", config.color.split(" ")[1])} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-700 leading-relaxed">{task.task}</p>
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", config.color)}>
                                  {task.duration}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div className="bg-teal-50 border border-teal-100 rounded-lg p-2 mt-2">
                          <p className="text-[10px] text-teal-600 font-medium">🎯 Goal: {day.goal}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Study Tips</p>
              <div className="space-y-1.5">
                {plan.tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-xl border border-surface-200 px-3 py-2 shadow-card">
                    <span className="text-emerald-500 text-sm shrink-0">✓</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconfigure */}
            <div className="flex gap-2">
              <Input type="number" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                placeholder="Days" min="1" max="30"
                className="rounded-xl text-sm bg-white border-surface-200 h-9 w-24" />
              <Input type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="Hrs/day" min="0.5" max="12" step="0.5"
                className="rounded-xl text-sm bg-white border-surface-200 h-9 w-24" />
              <Button variant="outline" size="sm" onClick={generate}
                className="rounded-xl gap-2 text-xs border-surface-200 flex-1">
                <Sparkles className="w-3 h-3" /> Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}