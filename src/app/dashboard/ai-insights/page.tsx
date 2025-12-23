'use client';

import { useChat } from 'ai/react';

export default function AIInsightsPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          AI Insights
        </h1>
        <p className="text-gray-400 mt-4 text-lg">Powered by Grok • Real-time growth intelligence</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-8 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 border-purple-500/60' : 'bg-gray-900/95 border-cyan-500/40'}`}>
              <p className="whitespace-pre-wrap text-white leading-relaxed text-lg">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-cyan-400">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about revenue, churn, growth..."
          className="flex-1 bg-transparent border-4 border-cyan-500 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="cyber-btn text-2xl px-10 py-4">
          Send
        </button>
      </form>
    </div>
  );
} 