import { useState, useRef, useEffect } from "react";
import { useAiStore } from "../store/aiStore";
import { askAI } from "../api/ai";
import { Loader2, Send, Bot, User } from "lucide-react";
import { AxiosError } from "axios";
import type { ApiError } from "../types";
import Button from "../components/Button";

export default function AiAssistantPage() {
  const { messages, isLoading, addMessage, setLoading, clearMessages } =
    useAiStore();
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null); // ← автоскрол

  // ← автоскрол до останнього повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const suggestions = [
    "What events am I attending this week?",
    "When is my next event?",
    "List all events I organize",
    "Show my upcoming events",
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Bot className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-500">
                Ask me anything about your events
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              Clear chat
            </Button>
          )}
        </div>
      </header>

      {/* Suggestions */}
      {messages.length === 0 && (
        <ul className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onClick={() => setQuestion(s)}
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-600 hover:border-green-300 hover:bg-green-50 transition-all"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <section aria-labelledby="chat-history-heading">
          {/* ← прихований заголовок для скрінрідерів */}
          <h2 id="chat-history-heading" className="sr-only">
            Chat history
          </h2>

          <ul
            aria-live="polite" // ← скрінрідер озвучує нові повідомлення
            className="mb-4 space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm max-h-[400px] overflow-y-auto"
          >
            {messages.map((msg, i) => (
              <li
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Bot
                      className="h-4 w-4 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User
                      className="h-4 w-4 text-gray-600"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </li>
            ))}

            {isLoading && (
              <li className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Bot className="h-4 w-4 text-green-600" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              </li>
            )}
            {/* ← якір для автоскролу */}
            <div ref={messagesEndRef} />
          </ul>
        </section>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="ai-question" className="sr-only">
          Your question
        </label>
        <input
          id="ai-question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your events..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          isLoading={isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </main>
  );
}
