'use client';

import { useChat } from 'ai/react';
import { Paperclip, Image, Smile, Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0f2c] overflow-hidden">
      {/* Cyberpunk network background – full screen */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#grid)" />
            <circle cx="200" cy="200" r="5" fill="cyan" opacity="0.6"/>
            <circle cx="800" cy="300" r="5" fill="purple" opacity="0.6"/>
            <circle cx="400" cy="600" r="5" fill="cyan" opacity="0.6"/>
            <line x1="200" y1="200" x2="800" y2="300" stroke="cyan" strokeWidth="1" opacity="0.4"/>
            <line x1="800" y1="300" x2="400" y2="600" stroke="purple" strokeWidth="1" opacity="0.4"/>
            <line x1="400" y1="600" x2="200" y2="200" stroke="cyan" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* Messages area – extra top padding to clear fixed header, no cut-off */}
      <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32"> {/* Increased pt-24 to clear header */}
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-cyan-500/30 animate-pulse rounded-full" />
                <svg className="h-64 w-64 text-cyan-400 drop-shadow-2xl" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <rect width="163.53" height="163.53" rx="40" className="opacity-20" />
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                {m.role === 'assistant' && (
                  <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                    <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                  </svg>
                )}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-2xl`}>
                {m.role === 'assistant' && <p className="text-cyan-400 text-sm mb-2">Grok online</p>}
                <div className={`relative px-6 py-4 rounded-2xl ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/80 to-cyan-900/80 text-white' : 'bg-gray-800/90 text-cyan-100'} backdrop-blur-md border border-cyan-500/30`}>
                  {/* Tail */}
                  <div className={`absolute top-0 w-0 h-0 border-8 border-transparent ${m.role === 'user' ? 'right-0 -mr-4 border-l-purple-900/80' : 'left-0 -ml-4 border-r-gray-800/90'}`} />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && <p className="text-center text-cyan-400 animate-pulse">Thinking...</p>}
        </div>
      </div>

      {/* Input bar – fixed at bottom, full width, safe area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-[#0a0f2c] to-transparent backdrop-blur-xl border-t border-cyan-400/30 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <button type="button" className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Paperclip className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Image className="w-6 h-6 text-cyan-300" />
          </button>

          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Message..."
            className="flex-1 bg-gray-800/70 text-white px-6 py-4 rounded-full border border-cyan-500/50 focus:outline-none focus:border-cyan-300 text-lg placeholder-cyan-400/60 backdrop-blur-md"
            autoFocus
          />

          <button type="button" className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 hover:bg-gray-700/50 transition rotate-180">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-bold text-black flex items-center gap-2 shadow-lg shadow-cyan-500/50 hover:scale-105 transition disabled:opacity-50"
          >
            Send
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}