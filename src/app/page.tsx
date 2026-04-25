import Link from "next/link";
import {
  Brain, ArrowRight, Sparkles, Zap, Shield,
  MessageSquare, FileText, Map, CreditCard,
  Lightbulb, Swords, GraduationCap, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MessageSquare, title: "AI Chat",       desc: "Q&A with citations",        color: "bg-brand-50 text-brand-500 border-brand-100" },
  { icon: FileText,      title: "Summaries",     desc: "Structured key points",     color: "bg-violet-50 text-violet-500 border-violet-100" },
  { icon: Map,           title: "Mind Maps",     desc: "Visual knowledge maps",     color: "bg-cyan-50 text-cyan-500 border-cyan-100" },
  { icon: CreditCard,    title: "Flashcards",    desc: "Smart study cards",         color: "bg-amber-50 text-amber-500 border-amber-100" },
  { icon: Lightbulb,     title: "Insight Mode",  desc: "Hidden patterns & risks",   color: "bg-pink-50 text-pink-500 border-pink-100" },
  { icon: Swords,        title: "Debate Mode",   desc: "Two AI agents debate",      color: "bg-red-50 text-red-500 border-red-100" },
  { icon: GraduationCap, title: "Exam Mode",     desc: "Adaptive quizzes",          color: "bg-orange-50 text-orange-500 border-orange-100" },
  { icon: Mic,           title: "Voice Q&A",     desc: "Speak your questions",      color: "bg-purple-50 text-purple-500 border-purple-100" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-16 border-b border-surface-100 bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-card-md">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">ThinkSpace</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl text-sm text-slate-500 hover:text-slate-900">
            Sign in
          </Button>
          <Link href="/workspace">
            <Button className="gradient-brand text-white rounded-xl text-sm shadow-card gap-2 px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-card">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Knowledge Workspace
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6 max-w-3xl">
          Learn faster with{" "}
          <span className="relative">
            <span className="gradient-brand bg-clip-text text-transparent">
              AI superpowers
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 9C50 4 100 2 150 4C200 6 250 8 298 5" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#4f46e5"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
          Upload any document. Chat, summarize, generate mind maps, flashcards,
          and get unique insights — all in one beautiful workspace.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 mb-16">
          <Link href="/workspace">
            <Button className="gradient-brand text-white rounded-2xl px-8 h-12 text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity gap-2">
              Open Workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" className="rounded-2xl px-8 h-12 text-sm font-semibold border-surface-200 text-slate-600 hover:bg-surface-50">
            Watch demo
          </Button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl w-full mb-12">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-surface-100 p-4 text-left shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          {[
            { icon: Zap,     text: "Powered by Llama 3.3" },
            { icon: Shield,  text: "Free to use" },
            { icon: Sparkles,text: "10+ AI features" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-brand-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}