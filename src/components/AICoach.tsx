'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

const suggestedQuestions = [
  "How can I reduce churn?",
  "What's driving my revenue growth?",
  "Which acquisition channel is best?",
  "How does my LTV:CAC compare?",
  "Give me 3 growth ideas this month",
];

export function AICoach() {
  const [open, setOpen] = useState(true); // Start open or false – your choice

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat', // ← Now uses your current Grok-powered Vercel backend
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400 p-6 z-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-black text-cyan-400 glow-title">
            AI Growth Coach
          </h2>
          <button onClick={() => setOpen(false)} className="text-cyan-400 text-2xl">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="max-h-60 overflow-y-auto mb-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-wrap justify-center gap-4">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(new SubmitEvent('submit'), { data: { prompt: q } })} // Optional: auto-send
                  className="text-cyan-300 text-lg px-6 py-3 rounded-full border border-cyan-400/50 hover:bg-cyan-400/20 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`text-left ${m.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-lg px-6 py-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-cyan-400/20 border border-cyan-400 text-cyan-200' 
                  : 'bg-white/10 text-cyan-100'
              }`}>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-left">
              <div className="inline-block px-6 py-4 rounded-2xl bg-white/10">
                <p className="text-lg text-cyan-300">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
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
            className="bg-cyan-400 text-black font-bold px-10 py-5 rounded-full text-2xl hover:bg-cyan-300 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}