"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, Loader2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceMessage {
  id: string;
  question: string;
  answer: string;
}

export default function VoicePanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<VoiceMessage[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { documents, getAllContent } = useDocumentStore();
  const hasDocuments = documents.some((d) => d.status === "ready");

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast.error("Your browser doesn't support voice input. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      if (result.isFinal) {
        handleVoiceQuery(text);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Could not capture voice. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleVoiceQuery = async (question: string) => {
    if (!question.trim() || !hasDocuments) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          documentContent: getAllContent(),
          history: [],
          explainMode: "normal",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const answer = data.response;
      setHistory((prev) => [
        { id: Date.now().toString(), question, answer },
        ...prev,
      ]);
      speakAnswer(answer);
      setTranscript("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakAnswer = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
          <Mic className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <span className="text-sm font-semibold text-slate-800">Voice Q&A</span>
        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-600 border-purple-200">NEW</Badge>
        {isSpeaking && (
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 ml-auto animate-pulse">
            Speaking...
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" style={{ minHeight: 0 }}>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!hasDocuments || isProcessing}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-card-lg",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 scale-110"
                  : hasDocuments
                  ? "gradient-brand hover:opacity-90 hover:scale-105"
                  : "bg-surface-200 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {!hasDocuments
                ? "Upload a document first"
                : isProcessing
                ? "Getting AI answer..."
                : isRecording
                ? "Listening... tap to stop"
                : "Tap to ask a question"}
            </p>
            {transcript && (
              <p className="text-xs text-brand-500 mt-1 font-medium animate-fade-in">
                &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>

          {isSpeaking && (
            <Button onClick={stopSpeaking} variant="outline" size="sm"
              className="rounded-xl gap-2 text-xs border-surface-200">
              <Square className="w-3 h-3" /> Stop Speaking
            </Button>
          )}

          {!isRecording && !isProcessing && history.length === 0 && hasDocuments && (
            <div className="w-full max-w-xs space-y-2 mt-2">
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-semibold">Try asking</p>
              {["What is the main topic?", "Summarize the key points", "What are the conclusions?"].map((tip) => (
                <button key={tip} onClick={() => handleVoiceQuery(tip)}
                  className="w-full text-xs bg-white border border-surface-200 rounded-xl px-3 py-2 text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-all text-left flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-brand-400 shrink-0" />
                  {tip}
                </button>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">History</p>
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
                <div className="bg-brand-50 border-b border-brand-100 px-4 py-2.5 flex items-start gap-2">
                  <Mic className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-brand-800">{item.question}</p>
                </div>
                <div className="px-4 py-3 flex items-start gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {item.answer.replace(/[#*`]/g, "")}
                  </p>
                </div>
                <div className="px-4 pb-2">
                  <button onClick={() => speakAnswer(item.answer)}
                    className="text-[10px] text-brand-500 hover:text-brand-700 font-medium flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Play again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}