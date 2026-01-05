'use client';

import { useChat } from 'ai/react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col font-orbitron text-cyan-100">
      <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-cyber-neon/30 animate-pulse rounded-full" />
              <svg className="h-64 w-64 text-cyber-neon drop-shadow-2xl" viewBox="0 0 163.53 163.53">
                <rect width="163.53" height="163.53" fill="currentColor" rx="40" className="opacity-20" />
                <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto space-y-10">
          {messages.map((m, i) => (
            <div key={m.id} className={`flex items-start gap-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-3xl px-8 py-6 rounded-3xl border-4 backdrop-blur-xl shadow-2xl
                ${m.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 border-purple-500/70' 
                  : 'bg-gray-900/95 border-cyber-neon/60'}`}
              >
                {m.role === 'assistant' && (
                  <p className="text-cyber-neon text-sm mb-4 opacity-90">
                    {i === 0 ? 'User connected\nGrok online' : 'Grok online'}
                  </p>
                )}
                <p className="text-xl md:text-2xl whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-8 py-6 rounded-3xl bg-gray-900/95 border-4 border-cyber-neon/60 backdrop-blur-xl">
                <p className="text-2xl text-cyber-neon animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-cyber-bg to-transparent backdrop-blur-2xl border-t-4 border-cyber-neon/30">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex items-center gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Message..."
            className="flex-1 bg-gray-900/80 text-white px-12 py-6 rounded-3xl border-4 border-cyber-neon/60 focus:border-cyber-neon focus:outline-none text-xl placeholder-cyan-400/70 backdrop-blur-md"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyber-neon to-purple-600 text-black font-bold px-12 py-6 rounded-3xl text-2xl shadow-2xl shadow-cyber-neon/60 hover:scale-105 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}