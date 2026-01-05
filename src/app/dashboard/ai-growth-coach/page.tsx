'use client';

import { useChat } from 'ai/react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center mt-40">
            {/* Centered Gray Grok Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-500" viewBox="0 0 163.53 163.53">
              <rect width="163.53" height="163.53" fill="currentColor" />
              <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" fill="white" />
            </svg>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl px-8 py-6 rounded-3xl shadow-md bg-${m.role === 'user' ? 'blue-100' : 'gray-100'} border border-gray-200 text-black`}>
              <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-8 py-6 rounded-3xl bg-gray-100 border border-gray-200">
              <p className="text-xl text-gray-500">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar with Buttons and Input */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-center gap-4 mb-4">
          <button className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition">
            <span className="mr-2">🔊</span> Voice Mode
          </button>
          <button className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition">
            <span className="mr-2">🎥</span> Create Videos
          </button>
          <button className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition">
            <span className="mr-2">📷</span> Open
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4 items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Anything"
            className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-6 py-4 text-xl text-black placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
            disabled={isLoading}
          />
          <select className="rounded-full bg-gray-200 px-4 py-4 text-gray-800">
            <option>Auto</option>
          </select>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-black text-white px-8 py-4 rounded-full font-bold text-xl hover:opacity-90 transition disabled:opacity-50"
          >
            Speak
          </button>
        </form>
      </div>
    </div>
  );
}