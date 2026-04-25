"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Link,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "sonner";

// ── Unique ID generator ───────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Format bytes ──────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone() {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const { addDocument, updateDocument, documents, removeDocument } =
    useDocumentStore();

  // ── Core upload function ──────────────────────────────────────────
  const processFile = useCallback(
    async (file: File) => {
      const id = genId();

      // Add to store immediately as "processing"
      addDocument({
        id,
        name: file.name,
        type: file.name.endsWith(".pdf") ? "pdf" : "text",
        content: "",
        size: file.size,
        uploadedAt: new Date(),
        status: "processing",
      });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "file");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        updateDocument(id, { content: data.content, status: "ready" });
        toast.success(`"${file.name}" uploaded successfully!`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        updateDocument(id, { status: "error", error: message });
        toast.error(message);
      }
    },
    [addDocument, updateDocument]
  );

  // ── URL upload ────────────────────────────────────────────────────
  const processUrl = async () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);

    const id = genId();
    const hostname = (() => {
      try { return new URL(urlInput).hostname; }
      catch { return urlInput; }
    })();

    addDocument({
      id,
      name: hostname,
      type: "url",
      content: "",
      url: urlInput,
      uploadedAt: new Date(),
      status: "processing",
    });

    try {
      const formData = new FormData();
      formData.append("type", "url");
      formData.append("url", urlInput);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch URL");

      updateDocument(id, { content: data.content, status: "ready" });
      toast.success(`"${hostname}" loaded successfully!`);
      setUrlInput("");
      setShowUrlInput(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed";
      updateDocument(id, { status: "error", error: message });
      toast.error(message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // ── Dropzone config ───────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => acceptedFiles.forEach(processFile),
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* ── Drop zone ── */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-brand-400 bg-brand-50 scale-[1.01]"
            : "border-surface-300 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              isDragActive ? "bg-brand-100" : "bg-surface-200"
            )}
          >
            <Upload
              className={cn(
                "w-6 h-6 transition-colors",
                isDragActive ? "text-brand-600" : "text-slate-400"
              )}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragActive ? "Drop files here..." : "Drop files here"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              or{" "}
              <span className="text-brand-500 font-medium">browse files</span>
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {["PDF", "TXT", "MD"].map((ext) => (
              <span
                key={ext}
                className="text-[10px] font-semibold bg-surface-200 text-slate-500 px-2 py-0.5 rounded-full"
              >
                {ext}
              </span>
            ))}
            <span className="text-[10px] text-slate-400">· Max 10MB</span>
          </div>
        </div>
      </div>

      {/* ── URL input toggle ── */}
      <div>
        {!showUrlInput ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-surface-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 gap-2 text-xs"
            onClick={() => setShowUrlInput(true)}
          >
            <Link className="w-3.5 h-3.5" />
            Import from URL
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processUrl()}
              placeholder="https://example.com/article"
              className="rounded-xl text-sm bg-surface-50 border-surface-200 focus-visible:ring-brand-400 h-9"
              autoFocus
            />
            <Button
              size="sm"
              className="rounded-xl gradient-brand text-white h-9 px-4 shrink-0"
              onClick={processUrl}
              disabled={isLoadingUrl}
            >
              {isLoadingUrl ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Load"
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-9 w-9 shrink-0"
              onClick={() => { setShowUrlInput(false); setUrlInput(""); }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Uploaded documents list ── */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 px-1">
            Documents ({documents.length})
          </p>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                doc.status === "ready"
                  ? "bg-white border-surface-200 hover:border-brand-200 hover:shadow-card"
                  : doc.status === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-surface-50 border-surface-200"
              )}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-brand-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {doc.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {doc.size ? formatBytes(doc.size) : doc.type.toUpperCase()}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0">
                {doc.status === "processing" && (
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                )}
                {doc.status === "ready" && (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
                {doc.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDocument(doc.id);
                  toast.info(`"${doc.name}" removed.`);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}