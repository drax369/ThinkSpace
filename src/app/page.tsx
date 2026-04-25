import Link from "next/link";
import { Brain, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-surface-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-card-md">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base">ThinkSpace</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl text-sm text-slate-600">
            Sign in
          </Button>
          <Link href="/workspace">
            <Button className="gradient-brand text-white rounded-xl text-sm shadow-card gap-2">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-3xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Knowledge Workspace
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
            Learn faster with
            <span className="gradient-brand bg-clip-text text-transparent">
              {" "}AI superpowers
            </span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl mx-auto">
            Upload any document. Chat, summarize, generate mind maps,
            flashcards, and get unique insights — all in one beautiful workspace.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/workspace">
              <Button className="gradient-brand text-white rounded-xl px-6 py-2.5 text-sm shadow-card-md hover:opacity-90 transition-opacity gap-2 h-11">
                Open Workspace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-xl px-6 py-2.5 text-sm border-surface-300 text-slate-600 h-11"
            >
              Watch demo
            </Button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-12 animate-slide-up">
          {[
            { icon: Zap,     label: "Insight Mode" },
            { icon: Shield,  label: "Debate Mode" },
            { icon: Sparkles,label: "Exam Adaptive AI" },
            { icon: Brain,   label: "Voice Q&A" },
            { icon: Zap,     label: "Study Planner" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 bg-white border border-surface-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-card"
            >
              <Icon className="w-3 h-3 text-brand-500" />
              {label}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}