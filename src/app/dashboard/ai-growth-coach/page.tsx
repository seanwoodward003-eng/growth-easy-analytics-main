'use client';

import { useChat } from 'ai/react';
import { Paperclip, Image, Smile, Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="fixed inset-0 flex flex-col bg- text-cyan-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-20 pb-32">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <svg className="w-64 h-64 text-cyan-400 animate-pulse" viewBox="0 0 163.53 163.53" fill="currentColor">
              <rect width="163.53" height="163.53" rx="40" opacity="0.15"/>
              <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51"/>
            </svg>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-12 h-12 rounded-full bg-gray-800 border-4 border-cyan-500 shadow-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                    <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51"/>
                  </svg>
                </div>
              )}
              <div className={`max-w-lg px-6 py-4 rounded-3xl ${m.role === 'user' ? 'bg-purple-600/80 text-white' : 'bg-cyan-900/60'}`}>
                {m.role === 'assistant' && <p className="text-cyan-400 text-xs mb-1">Grok online</p>}
                <p className="text-lg">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-center text-cyan-400">Thinking...</div>}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg- /95 backdrop-blur border-t border-cyan-500/30">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <button type="button" className="p-3 bg-cyan-900/50 rounded-xl"><Paperclip className="w-6 h-6 text-cyan-300"/></button>
          <button type="button" className="p-3 bg-cyan-900/50 rounded-xl"><Image className="w-6 h-6 text-cyan-300"/></button>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 bg-gray-900/70 text-white px-5 py-4 rounded-xl border border-cyan-500/50 focus:outline-none focus:border-cyan-300 text-lg"
          />
          <button type="button" className="p-3 bg-cyan-900/50 rounded-xl"><Smile className="w-6 h-6 text-cyan-300"/></button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            Send <Send className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
}