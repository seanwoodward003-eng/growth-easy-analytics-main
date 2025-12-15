'use client';

import { useChat } from 'ai/react';

export default function AIInsightsPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: '/api/chat',
    onError: (e) => {
      console.error(e);
      alert('Failed to connect to AI Insights. Please try again later.');
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Welcome to AI Insights 👋\n\nI'm analyzing your live business data in real-time — revenue, churn rate, LTV/CAC ratio, retention, top acquisition channel, at-risk customers, and more.\n\nAsk me anything:\n• “Why is my churn increasing?”\n• “How can I improve my LTV/CAC ratio?”\n• “What are 3 quick wins to boost profit this month?”\n• “How should I optimize my top channel?”",
      },
    ],
  });

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 pb-24 md:pb-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          AI Insights
        </h1>
        <p className="text-gray-400 mt-4 text-lg">Powered by Grok • Real-time growth intelligence</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-8 space-y-6 px-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-purple-900/70 to-cyan-900/70 border-purple-500/60'
                  : 'bg-gray-900/95 border-cyan-500/40'
              }`}
            >
              <p className="whitespace-pre-wrap text-white leading-relaxed text-lg">{m.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-6 py-4 rounded-2xl bg-gray-900/95 border border-cyan-500/40">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-200" />
              </div>
              <span className="ml-3 text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed md:static bottom-0 left-0 right-0 p-4 md:p-0 bg-gradient-to-t from-black via-black/90 to-transparent md:bg-none"
      >
        <div className="flex gap-4 max-w-5xl mx-auto items-center bg-gray-900/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about revenue, churn, acquisition, retention..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Send
          </button>
        </div>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6 hidden md:block">
        Pro tip: Be specific — “How can I reduce churn by 20%?” gets the best results.
      </p>
    </div>
  );
}