import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  explainMode: "normal" | "simple" | "expert";

  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (val: boolean) => void;
  setExplainMode: (mode: "normal" | "simple" | "expert") => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  explainMode: "normal",

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content,
          isLoading: false,
        };
      }
      return { messages };
    }),

  setLoading: (val) => set({ isLoading: val }),
  setExplainMode: (mode) => set({ explainMode: mode }),
  clearMessages: () => set({ messages: [] }),
}));