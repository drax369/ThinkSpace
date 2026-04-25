"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  createdAt: string;
  color: "yellow" | "blue" | "green" | "pink";
}

const colorMap = {
  yellow: "bg-amber-50 border-amber-200 text-amber-900",
  blue:   "bg-blue-50 border-blue-200 text-blue-900",
  green:  "bg-emerald-50 border-emerald-200 text-emerald-900",
  pink:   "bg-pink-50 border-pink-200 text-pink-900",
};

const colors: Note["color"][] = ["yellow", "blue", "green", "pink"];

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [selectedColor, setSelectedColor] = useState<Note["color"]>("yellow");

  const addNote = () => {
    if (!input.trim()) return;
    setNotes((prev) => [
      {
        id: Date.now().toString(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
        color: selectedColor,
      },
      ...prev,
    ]);
    setInput("");
    toast.success("Note saved!");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.info("Note deleted");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <span className="text-sm font-semibold text-slate-800">Notes</span>
        {notes.length > 0 && (
          <span className="text-xs text-slate-400 ml-auto">
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
        {/* Input area */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-3 space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) addNote();
            }}
            placeholder="Write a note... (⌘Enter to save)"
            rows={3}
            className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-300 leading-relaxed"
          />
          <div className="flex items-center justify-between">
            {/* Color picker */}
            <div className="flex gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    c === "yellow"
                      ? "bg-amber-300"
                      : c === "blue"
                      ? "bg-blue-300"
                      : c === "green"
                      ? "bg-emerald-300"
                      : "bg-pink-300"
                  } ${
                    selectedColor === c
                      ? "border-slate-500 scale-110"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={addNote}
              disabled={!input.trim()}
              className="gradient-brand text-white rounded-xl gap-1.5 text-xs h-7 px-3"
            >
              <Plus className="w-3 h-3" /> Add Note
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-emerald-200" />
            </div>
            <p className="text-sm text-slate-400">No notes yet</p>
            <p className="text-xs text-slate-300 mt-1">
              Write something above to get started
            </p>
          </div>
        ) : (
          /* Notes grid */
          <div className="columns-2 gap-3 space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`break-inside-avoid rounded-xl border p-3 group relative ${colorMap[note.color]}`}
              >
                <p className="text-xs leading-relaxed whitespace-pre-wrap mb-2">
                  {note.text}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 opacity-60">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[10px]">{formatTime(note.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 opacity-50 hover:opacity-100" />
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