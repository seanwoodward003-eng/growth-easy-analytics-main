'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

export function AICoach() {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for input focus

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when chat opens (fixes mobile tap issue)
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Prevent event bubbling on input taps (helps mobile focus)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Floating Bubble Button - Pro: Sleeker gradient, subtle animation */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-purple-700 shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:rotate-12"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window - Pro: Taller, blurred glass, neon borders, no outside close */}
      {open && (
        <div 
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:justify-end md:pr-8"
          onClick={(e) => e.stopPropagation()} // Prevent close on inside clicks; no outside close
        >
          <div 
            className="w-full max-w-md h-[80vh] md:h-[700px] md:w-96 bg-[#0a0f2c]/95 backdrop-blur-xl border-2 border-cyan-400/50 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ease-out animate-slide-up"
            onClick={(e) => e.stopPropagation()} // Ensure taps inside don't bubble
          >
            {/* Header - Pro: Clean, gradient */}
            <div className="bg-gradient-to-r from-purple-900/70 to-cyan-900/70 p-4 flex justify-between items-center border-b border-cyan-400/30">
              <h3 className="text-xl font-bold text-cyan-300 tracking-wide">AI Growth Coach</h3>
              <button onClick={() => setOpen(false)} className="text-cyan-300 hover:text-white text-xl">
                ✕
              </button>
            </div>

            {/* Messages - Pro: Smooth scroll, cyberpunk bubbles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-cyan-400 drop-shadow-md"
                      viewBox="0 0 163.53 163.53"
                    >
                      <rect width="163.53" height="163.53" fill="currentColor" rx="32" className="opacity-20" />
                      <polygon
                        points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm border border-cyan-500/30 ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-700/70 to-cyan-700/70 text-white' 
                      : 'bg-gray-800/80 text-cyan-100'
                  }`}>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-gray-800/80 border-cyan-500/30">
                    <p className="text-cyan-300 animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Pro: Glowing on focus, touch-friendly */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-400/30">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onTouchStart={handleTouchStart} // Fix for mobile tap
                  placeholder="Ask about growth..."
                  className="flex-1 bg-gray-900/70 text-white px-4 py-3 rounded-2xl border border-cyan-500/40 focus:outline-none focus:border-cyan-300 focus:shadow-cyan-500/50 transition-all duration-300 text-base placeholder-cyan-400/70"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}