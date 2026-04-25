import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "text" | "url";
  content: string;
  size?: number;
  url?: string;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  error?: string;
}

interface DocumentStore {
  documents: Document[];
  activeDocumentId: string | null;
  isUploading: boolean;
  addDocument: (doc: Omit<Document, "uploadedAt"> & { uploadedAt: Date }) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
  setUploading: (val: boolean) => void;
  getActiveDocument: () => Document | null;
  getAllContent: () => string;
  clearAll: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      activeDocumentId: null,
      isUploading: false,

      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, uploadedAt: doc.uploadedAt.toISOString() },
          ],
          activeDocumentId: doc.id,
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          activeDocumentId:
            state.activeDocumentId === id ? null : state.activeDocumentId,
        })),

      setActiveDocument: (id) => set({ activeDocumentId: id }),
      setUploading: (val) => set({ isUploading: val }),

      getActiveDocument: () => {
        const { documents, activeDocumentId } = get();
        return documents.find((d) => d.id === activeDocumentId) ?? null;
      },

      getAllContent: () => {
        const { documents } = get();
        return documents
          .filter((d) => d.status === "ready")
          .map((d) => `[Document: ${d.name}]\n${d.content}`)
          .join("\n\n---\n\n");
      },

      clearAll: () => set({ documents: [], activeDocumentId: null }),
    }),
    {
      name: "thinkspace-documents",
      // Only persist essential fields, skip large content for perf
      partialize: (state) => ({
        documents: state.documents.map((d) => ({
          ...d,
          // Limit stored content to 20k chars to avoid localStorage limits
          content: d.content.slice(0, 20000),
        })),
        activeDocumentId: state.activeDocumentId,
      }),
    }
  )
);