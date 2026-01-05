'use client';

import { useChat } from 'ai/react';
import { Paperclip, Image, Smile, Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0f2c]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-cyan-500/30 animate-pulse rounded-full" />
                <svg className="h-64 w-64 text-cyan-400 drop-shadow-2xl" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <rect width="163.53" height="163.53" rx="40" opacity="0.2" />
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-12 h-12 rounded-full bg-gray-800/80 border-4 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                    <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                  </svg>
                </div>
              )}

              <div className={`max-w-xl px-6 py-4 rounded-3xl ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 text-white' : 'bg-cyan-900/40 text-cyan-100'} border-2 ${m.role === 'user' ? 'border-purple-500/60' : 'border-cyan-500/50'} backdrop-blur-md`}>
                {m.role === 'assistant' && <p className="text-cyan-400 text-sm mb-1">Grok online</p>}
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800/80 border-4 border-cyan-500/50 shadow-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>
              <div className="px-6 py-4 rounded-3xl bg-cyan-900/40 border-2 border-cyan-500/50 backdrop-blur-md">
                <p className="text-lg text-cyan-300 animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0f2c]/95 backdrop-blur-lg border-t border-cyan-400/30">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <button type="button" className="p-3 rounded-xl bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Paperclip className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" className="p-3 rounded-xl bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Image className="w-6 h-6 text-cyan-300" />
          </button>

          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about revenue, churn, acquisition, or growth..."
            className="flex-1 bg-gray-800/70 text-white px-5 py-4 rounded-xl border border-cyan-500/50 focus:outline-none focus:border-cyan-300 text-lg placeholder-cyan-400/60"
          />

          <button type="button" className="p-3 rounded-xl bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-50"
          >
            Send
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}