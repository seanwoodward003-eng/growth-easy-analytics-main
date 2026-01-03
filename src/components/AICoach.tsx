'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

export function AICoach() {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl hover:shadow-cyan-500/60 flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window - Spacious & Clean */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] md:h-[700px] bg-[#0a0f2c]/98 backdrop-blur-xl border-4 border-cyan-400/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/80 to-cyan-900/80 p-5 flex justify-between items-center border-b border-cyan-400/40">
            <h3 className="text-2xl font-black text-cyan-300">AI Growth Coach</h3>
            <button onClick={() => setOpen(false)} className="text-cyan-300 hover:text-white text-2xl">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <p className="text-center text-cyan-300/70 text-lg mt-10">
                Ask me anything about your revenue, churn, or growth...
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-lg backdrop-blur-sm border ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 border-purple-500/60 text-white' 
                    : 'bg-gray-800/90 border-cyan-500/40 text-white'
                }`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-6 py-4 rounded-3xl bg-gray-800/90 border-cyan-500/40">
                  <p className="text-cyan-300">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Big and spacious */}
          <form onSubmit={handleSubmit} className="p-6 border-t border-cyan-400/40">
            <div className="flex gap-4">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about growth..."
                className="flex-1 bg-gray-900/80 text-white px-6 py-4 rounded-2xl border border-cyan-500/50 focus:outline-none focus:border-cyan-400 transition text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}