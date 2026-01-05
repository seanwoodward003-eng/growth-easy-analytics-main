'use client';

import { useChat } from 'ai/react';
import { Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0f2c]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <svg className="h-64 w-64 text-cyan-400 animate-pulse drop-shadow-2xl" viewBox="0 0 163.53 163.53" fill="currentColor">
                <rect width="163.53" height="163.53" rx="40" opacity="0.15" />
                <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
              </svg>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-6 py-4 rounded-3xl ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 text-white' : 'bg-gray-800/80 text-cyan-100'} backdrop-blur-md border border-cyan-500/30`}>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-6 py-4 rounded-3xl bg-gray-800/80 text-cyan-100 backdrop-blur-md border border-cyan-500/30">
                <p className="text-lg animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar — exactly like Grok */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0f2c] to-transparent backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about revenue, churn, acquisition, or growth..."
            className="flex-1 bg-gray-900/70 text-white px-8 py-5 rounded-full border border-cyan-500/50 focus:outline-none focus:border-cyan-300 text-xl placeholder-cyan-400/60 backdrop-blur-md"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-xl flex items-center gap-3 disabled:opacity-50"
          >
            Send
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}