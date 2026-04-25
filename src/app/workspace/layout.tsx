import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Left Sidebar — wrapped in Suspense for useSearchParams() */}
      <Suspense
        fallback={
          <div className="w-[260px] bg-white border-r border-surface-200 shrink-0 animate-pulse" />
        }
      >
        <Sidebar />
      </Suspense>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}