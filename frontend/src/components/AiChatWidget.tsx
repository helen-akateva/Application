import { useState, useRef, useEffect } from "react";
import { useAiStore } from "../store/aiStore";
import { useAuthStore } from "../store/authStore";
import { askAI } from "../api/ai";
import { Send, Bot, X, Trash2,} from "lucide-react";
import { AxiosError } from "axios";
import type { ApiError } from "../types";
import Button from "./Button";

const suggestions = [
  "What events am I attending this week?",
  "When is my next event?",
  "List all events I organize",
  "Show tech events this weekend",
];

export default function AiChatWidget() {
  const { isAuthenticated, user } = useAuthStore();
  const { messages, isLoading, addMessage, setLoading, clearMessages } =
    useAiStore();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    addMessage({ role: "user", text: trimmed });
    setQuestion("");
    setLoading(true);

    try {
      const answer = await askAI(trimmed);
      addMessage({ role: "assistant", text: answer });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      addMessage({
        role: "assistant",
        text:
          axiosError.response?.data?.message ||
          "Sorry, I didn't understand that. Please try rephrasing your question.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-[100]">
      {/* Контейнер, що обмежує рух кнопки межами твого основного контенту (max-w-1280px) */}
      <div className="max-w-[1280px] mx-auto relative px-4 h-full pointer-events-none">
        {/* Chat window */}
        {isOpen && (
          <aside
            aria-label="AI Chat Assistant"
            className="pointer-events-auto absolute bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          >
            {/* Header */}
            <header className="flex items-center justify-between bg-green-600 px-4 py-3 shadow-md shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight uppercase tracking-tight">
                    AI Assistant
                  </h2>
                  <p className="text-[10px] text-green-100 font-medium">
                    Ask about your events
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="p-2 text-green-100 hover:text-white transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-green-100 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <ul
              aria-live="polite"
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 list-none"
            >
              {messages.length === 0 && (
                <li className="space-y-4">
                  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 italic font-medium">
                      "Hi, {user?.name}! How can I help you today?" 👋
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuestion(s)}
                        className="text-[11px] bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 px-3 py-1.5 rounded-full shadow-sm transition-all active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </li>
              )}

              {messages.map((msg, i) => (
                <li
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-sm">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] shadow-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </li>
              ))}

              {isLoading && (
                <li className="flex gap-2">
                  <div className="h-7 w-7 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </span>
                  </div>
                </li>
              )}
              <li
                ref={messagesEndRef}
                aria-hidden="true"
                className="h-px w-full list-none"
              />
            </ul>

            {/* Footer Input */}
            <footer className="bg-white border-t p-3 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  id="ai-widget-question"
                  type="text"
                  enterKeyHint="send"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about events..."
                  className="flex-1 rounded-xl border border-gray-200 pl-3 pr-10 py-2.5 text-sm outline-none focus:border-green-500 transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-1 top-1.5">
                  <Button
                    type="submit"
                    size="sm"
                    className="!p-1.5 !rounded-lg"
                    disabled={isLoading || !question.trim()}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </form>
              <p className="text-[9px] text-gray-400 text-center mt-2 font-medium">
                Read-only mode enabled
              </p>
            </footer>
          </aside>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`pointer-events-auto absolute bottom-4 right-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isOpen ? "bg-gray-800 rotate-90 shadow-none" : "bg-green-600"
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-white" /> // Повернув робота назад
          )}

          {/* Бейдж з кількістю повідомлень */}
          {!isOpen && messages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
