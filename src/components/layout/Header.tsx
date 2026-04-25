"use client";

import { Search, Bell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const modeLabels: Record<string, { label: string; color: string }> = {
  chat:      { label: "Chat",          color: "bg-brand-100 text-brand-700" },
  summary:   { label: "Summary",       color: "bg-violet-100 text-violet-700" },
  mindmap:   { label: "Mind Map",      color: "bg-cyan-100 text-cyan-700" },
  flashcard: { label: "Flashcards",    color: "bg-amber-100 text-amber-700" },
  notes:     { label: "Notes",         color: "bg-emerald-100 text-emerald-700" },
  insight:   { label: "Insight Mode",  color: "bg-pink-100 text-pink-700" },
  debate:    { label: "Debate Mode",   color: "bg-red-100 text-red-700" },
  exam:      { label: "Exam Mode",     color: "bg-orange-100 text-orange-700" },
  planner:   { label: "Study Planner", color: "bg-teal-100 text-teal-700" },
  voice:     { label: "Voice Q&A",     color: "bg-purple-100 text-purple-700" },
};

export default function Header({ mode }: { mode?: string }) {
  const current = modeLabels[mode ?? "chat"] ?? modeLabels["chat"];

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center px-6 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <Badge className={`${current.color} border-0 font-medium text-xs px-2.5`}>
          {current.label}
        </Badge>
      </div>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search your notebooks..."
          className="pl-9 bg-surface-50 border-surface-200 rounded-xl text-sm focus-visible:ring-brand-400 h-9"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-xl border-brand-200 text-brand-600 hover:bg-brand-50 text-xs h-8"
        >
          <Zap className="w-3 h-3" />
          Upgrade
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl w-9 h-9 relative text-slate-500 hover:text-slate-900"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-xl p-1 h-9 w-9">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                  TS
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel className="text-xs text-slate-500">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm rounded-lg">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-sm rounded-lg">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-sm rounded-lg">Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-red-500 rounded-lg">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}