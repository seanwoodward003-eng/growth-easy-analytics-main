'use client';

import { useChat } from 'ai/react';
import { Paperclip, Image, Smile, Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-screen bg-[#0a0f2c] flex flex-col relative">
      {/* Subtle cyberpunk background depth */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-400/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 pb-32">
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-cyan-500/30 animate-pulse rounded-full" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-64 w-64 text-cyan-400 drop-shadow-2xl"
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
        <div className="max-w-5xl mx-auto space-y-8">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex-shrink-0 border-4 ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-600 border-purple-500/70 shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800/80 border-cyan-500/50 shadow-lg shadow-cyan-500/30'
                } flex items-center justify-center`}
              >
                {m.role === 'assistant' && (
                  <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                    <rect width="163.53" height="163.53" rx="30" opacity="0.3" />
                    <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                  </svg>
                )}
                {m.role === 'user' && <div className="text-2xl font-bold text-white">You</div>}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-2xl`}>
                {/* Status for assistant only */}
                {m.role === 'assistant' && (
                  <p className="text-cyan-400 text-sm mb-2 px-2 font-medium">Grok online</p>
                )}

                <div
                  className={`relative px-6 py-4 rounded-2xl backdrop-blur-md border-2 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 border-purple-500/60 text-white rounded-tr-none'
                      : 'bg-cyan-900/40 border-cyan-500/50 text-cyan-100 rounded-tl-none'
                  }`}
                >
                  {/* Tail */}
                  <div
                    className={`absolute top-0 w-4 h-4 bg-inherit border-2 ${
                      m.role === 'user'
                        ? 'right-0 -translate-x-full border-l-0 border-b-0 border-purple-500/60 rounded-br-xl'
                        : 'left-0 translate-x-0 border-r-0 border-t-0 border-cyan-500/50 rounded-tl-xl'
                    }`}
                  />

                  <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800/80 border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <rect width="163.53" height="163.53" rx="30" opacity="0.3" />
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-cyan-400 text-sm mb-2 px-2 font-medium">Grok online</p>
                <div className="relative px-6 py-4 rounded-2xl bg-cyan-900/40 border-2 border-cyan-500/50 rounded-tl-none backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-4 h-4 bg-cyan-900/40 border-2 border-r-0 border-t-0 border-cyan-500/50 rounded-tl-xl" />
                  <p className="text-lg md:text-xl text-cyan-300 animate-pulse">Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-[#0a0f2c] to-[#0a0f2c]/80 backdrop-blur-2xl border-t-2 border-cyan-400/30">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex items-center gap-4">
          <button type="button" className="p-4 rounded-lg bg-cyan-900/30 border-2 border-cyan-500/40 hover:bg-cyan-900/50 transition">
            <Paperclip className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" className="p-4 rounded-lg bg-cyan-900/30 border-2 border-cyan-500/40 hover:bg-cyan-900/50 transition">
            <Image className="w-6 h-6 text-cyan-300" />
          </button>

          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about revenue, churn, acquisition, or growth..."
              className="w-full bg-gray-900/70 text-white px-6 py-5 pr-12 rounded-2xl border-2 border-cyan-500/50 focus:outline-none focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/50 transition-all text-lg placeholder-cyan-400/60 backdrop-blur-md"
              autoFocus
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-2xl">
              →
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-bold text-xl shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
          >
            Send
            <Send className="w-6 h-6" />
          </button>

          <button type="button" className="p-4 rounded-lg bg-cyan-900/30 border-2 border-cyan-500/40 hover:bg-cyan-900/50 transition">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>
        </form>
      </div>
    </div>
  );
}