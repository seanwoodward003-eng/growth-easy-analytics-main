'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

const suggestedQuestions = [
  "How can I reduce churn?",
  "What's driving my revenue growth?",
  "Which acquisition channel is best?",
  "How does my LTV:CAC compare?",
  "Give me 3 growth ideas this month",
];

export function AICoach() {
  const [open, setOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400 p-6 z-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-black text-cyan-400 glow-title">
            AI Growth Coach
          </h2>
          <button onClick={() => setOpen(false)} className="text-cyan-400 text-2xl hover:text-cyan-200">
            ✕
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto mb-6 space-y-4 px-2">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-wrap justify-center gap-3">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(new Event('submit') as any, { data: { prompt: q } })}
                  className="text-cyan-300 text-lg px-6 py-3 rounded-full border border-cyan-400/50 hover:bg-cyan-400/20 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-3xl px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 border-purple-500/60' : 'bg-gray-900/95 border-cyan-500/40'}`}>
                <p className="whitespace-pre-wrap text-white leading-relaxed text-lg">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="px-6 py-4 rounded-2xl bg-gray-900/95 border-cyan-500/40">
                <p className="text-lg text-cyan-300">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about churn, revenue, growth..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-4 border-cyan-400 rounded-full px-8 py-5 text-xl text-cyan-200 placeholder-cyan-500 focus:outline-none glow-soft"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-400 text-black font-bold px-10 py-4 rounded-full text-2xl hover:bg-cyan-300 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}