import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AiStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (msg: Message) => void;
  setLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg].slice(-50), 
        })),
      setLoading: (isLoading) => set({ isLoading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ai-chat-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
