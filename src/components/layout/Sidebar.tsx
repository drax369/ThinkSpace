"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Brain,
  FileText,
  MessageSquare,
  Map,
  CreditCard,
  Lightbulb,
  Swords,
  GraduationCap,
  CalendarDays,
  Mic,
  Settings,
  ChevronLeft,
  Plus,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import UploadZone from "@/components/upload/UploadZone";
import { useDocumentStore } from "@/store/documentStore";

// ── Navigation config ─────────────────────────────────────────────────
const mainNav = [
  { id: "chat",      label: "Chat",       icon: MessageSquare, href: "/workspace?mode=chat" },
  { id: "summary",   label: "Summary",    icon: FileText,      href: "/workspace?mode=summary" },
  { id: "mindmap",   label: "Mind Map",   icon: Map,           href: "/workspace?mode=mindmap" },
  { id: "flashcard", label: "Flashcards", icon: CreditCard,    href: "/workspace?mode=flashcard" },
  { id: "notes",     label: "Notes",      icon: BookOpen,      href: "/workspace?mode=notes" },
];

const uniqueNav = [
  { id: "insight", label: "Insight Mode",  icon: Lightbulb,     href: "/workspace?mode=insight",  badge: "AI" },
  { id: "debate",  label: "Debate Mode",   icon: Swords,        href: "/workspace?mode=debate",   badge: "AI" },
  { id: "exam",    label: "Exam Mode",     icon: GraduationCap, href: "/workspace?mode=exam",     badge: "AI" },
  { id: "planner", label: "Study Planner", icon: CalendarDays,  href: "/workspace?mode=planner",  badge: "AI" },
  { id: "voice",   label: "Voice Q&A",     icon: Mic,           href: "/workspace?mode=voice",    badge: "NEW" },
];

// ── NavItem component ─────────────────────────────────────────────────
function NavItem({
  item,
  collapsed,
  active,
}: {
  item: (typeof mainNav)[0] & { badge?: string };
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  const inner = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
        active
          ? "bg-brand-500 text-white shadow-glow"
          : "text-slate-600 hover:bg-surface-100 hover:text-slate-900"
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-110",
          collapsed ? "w-5 h-5" : "w-4 h-4"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-semibold",
                active
                  ? "bg-white/20 text-white border-white/30"
                  : item.badge === "NEW"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-brand-100 text-brand-700 border-brand-200"
              )}
              variant="outline"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
          {item.badge && (
            <span className="ml-1 text-brand-400">· {item.badge}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

// ── Main Sidebar ──────────────────────────────────────────────────────
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // ✅ Proper Next.js hooks — no window.location
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeMode = searchParams.get("mode") ?? "chat";

  const { documents } = useDocumentStore();

  // Suppress unused variable warning for pathname
  void pathname;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "relative flex flex-col h-full bg-white border-r border-surface-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* ── Logo ── */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-surface-200 shrink-0",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-card-md shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-900 text-base tracking-tight">
              ThinkSpace
            </span>
          )}
        </div>

        {/* ── Upload section ── */}
        <div className="p-3 border-b border-surface-200 space-y-2">
          <Button
            className={cn(
              "w-full gradient-brand text-white shadow-card hover:opacity-90 transition-opacity rounded-xl",
              collapsed ? "px-0 justify-center" : "gap-2"
            )}
            size="sm"
            onClick={() => !collapsed && setShowUpload(!showUpload)}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span>{showUpload ? "Hide Upload" : "Add Documents"}</span>
            )}
          </Button>

          {/* Upload zone */}
          {!collapsed && showUpload && (
            <div className="animate-fade-in">
              <UploadZone />
            </div>
          )}

          {/* Doc count */}
          {!collapsed && documents.length > 0 && !showUpload && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-[11px] text-slate-500">
                {documents.length} document{documents.length > 1 ? "s" : ""} loaded
              </span>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <ScrollArea className="flex-1 p-3 h-0">
          <nav className="space-y-6">
            {/* Tools */}
            <div>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
                  Tools
                </p>
              )}
              <div className="space-y-1">
                {mainNav.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    active={activeMode === item.id}
                  />
                ))}
              </div>
            </div>

            {/* AI Modes */}
            <div>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
                  AI Modes
                </p>
              )}
              <div className="space-y-1">
                {uniqueNav.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    active={activeMode === item.id}
                  />
                ))}
              </div>
            </div>
          </nav>
        </ScrollArea>

        {/* ── Bottom settings ── */}
        <div className="p-3 border-t border-surface-200">
          <NavItem
            item={{
              id: "settings",
              label: "Settings",
              icon: Settings,
              href: "/workspace?mode=settings",
            }}
            collapsed={collapsed}
            active={activeMode === "settings"}
          />
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-surface-200 rounded-full flex items-center justify-center shadow-card hover:shadow-card-md transition-all duration-200 hover:border-brand-300 hover:text-brand-500 z-10 text-slate-400"
        >
          <ChevronLeft
            className={cn(
              "w-3 h-3 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>
    </TooltipProvider>
  );
}