'use client';

import { useChat } from 'ai/react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0f2c] flex flex-col">
      {/* Header */}
      <div className="p-8 md:p-12 text-center border-b border-cyan-400/30">
        <h1 className="glow-title text-6xl md:text-8xl font-black mb-6">
          AI Growth Coach
        </h1>
        <p className="text-2xl md:text-3xl text-cyan-300">
          Powered by Grok • Real-time growth intelligence
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-3xl md:text-4xl text-cyan-300 mb-12">
              Ask me anything about your revenue, churn, acquisition, or growth...
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "How can I reduce churn?",
                "What's driving my revenue growth?",
                "Which acquisition channel is best?",
                "How does my LTV:CAC compare?",
                "Give me 3 growth ideas this month",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(new Event('submit') as any, { data: { prompt: q } })}
                  className="text-cyan-300 text-lg md:text-xl px-8 py-4 rounded-full border-2 border-cyan-400/50 hover:bg-cyan-400/20 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl px-8 py-6 rounded-3xl shadow-2xl backdrop-blur-md border-4 ${
              m.role === 'user' 
                ? 'bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border-purple-500/70 text-white' 
                : 'bg-gray-900/95 border-cyan-500/60 text-white'
            }`}>
              <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-8 py-6 rounded-3xl bg-gray-900/95 border-4 border-cyan-500/60">
              <p className="text-2xl text-cyan-300">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 md:p-12 border-t border-cyan-400/30">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-6">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about revenue, churn, growth..."
            className="flex-1 bg-transparent border-4 border-cyan-500 rounded-full px-10 py-6 text-2xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-300 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-12 py-6 rounded-full font-bold text-2xl hover:opacity-90 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}