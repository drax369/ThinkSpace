import Header from "@/components/layout/Header";
import ChatPanel from "@/components/workspace/ChatPanel";
import SummaryPanel from "@/components/workspace/SummaryPanel";
import FlashcardsPanel from "@/components/workspace/FlashcardsPanel";
import MindMapPanel from "@/components/workspace/MindMapPanel";
import InsightPanel from "@/components/workspace/InsightPanel";
import DebatePanel from "@/components/workspace/DebatePanel";
import PlannerPanel from "@/components/workspace/PlannerPanel";
import NotesPanel from "@/components/workspace/NotesPanel";
import ExamPanel from "@/components/workspace/ExamPanel";
import VoicePanel from "@/components/workspace/VoicePanel";
import { Sparkles } from "lucide-react";

const validModes = [
  "chat","summary","flashcard","mindmap",
  "insight","debate","planner","notes","exam","voice",
];

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params?.mode ?? "chat";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header mode={mode} />
      <main className="flex-1 overflow-hidden">
        {mode === "chat"      && <ChatPanel />}
        {mode === "summary"   && <SummaryPanel />}
        {mode === "flashcard" && <FlashcardsPanel />}
        {mode === "mindmap"   && <MindMapPanel />}
        {mode === "insight"   && <InsightPanel />}
        {mode === "debate"    && <DebatePanel />}
        {mode === "planner"   && <PlannerPanel />}
        {mode === "notes"     && <NotesPanel />}
        {mode === "exam"      && <ExamPanel />}
        {mode === "voice"     && <VoicePanel />}

        {!validModes.includes(mode) && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Coming Soon!</h1>
            <p className="text-slate-500 text-sm max-w-sm">
              Try Chat, Summary, Flashcards, Mind Map, Insight, Debate, Study Planner, Notes, Exam, or Voice Q&A!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}