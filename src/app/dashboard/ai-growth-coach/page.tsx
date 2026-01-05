'use client';

import { useChat } from 'ai/react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-screen bg-[#0a0f2c] flex flex-col">
      {/* Main Chat Area - Expands to fill space */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 pb-32">
        {/* Empty State - Centered pulsing neon logo */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-cyan-500/30 animate-pulse rounded-full"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-48 w-48 md:h-64 md:w-64 text-cyan-400 drop-shadow-2xl"
                viewBox="0 0 163.53 163.53"
              >
                <rect width="163.53" height="163.53" fill="currentColor" rx="40" className="opacity-20" />
                <polygon
                  points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-4xl px-8 py-6 rounded-3xl shadow-2xl backdrop-blur-md border-4 ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border-purple-500/70 text-white'
                  : 'bg-gray-900/95 border-cyan-500/60 text-cyan-100'
              }`}
            >
              <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-8 py-6 rounded-3xl bg-gray-900/95 border-4 border-cyan-500/60 backdrop-blur-md">
              <p className="text-2xl text-cyan-300 animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Bar - Large, glowing, cyberpunk */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-[#0a0f2c] via-[#0a0f2c]/90 to-transparent backdrop-blur-xl border-t-4 border-cyan-400/30">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-6 items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about revenue, churn, acquisition, or growth..."
            className="flex-1 bg-gray-900/70 text-white px-10 py-6 rounded-full border-4 border-cyan-500/50 focus:outline-none focus:border-cyan-300 focus:shadow-2xl focus:shadow-cyan-500/50 transition-all duration-300 text-xl placeholder-cyan-400/70 backdrop-blur-md"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-12 py-6 rounded-full font-black text-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/80 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}