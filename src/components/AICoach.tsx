'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How can I reduce churn?",
    "What's driving my revenue growth?",
    "Which acquisition channel is best?",
    "How does my LTV:CAC compare?",
    "Give me 3 growth ideas this month",
  ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://growth-easy-analytics-2.onrender.com/api/chat', {  // ← FULL BACK-END URL
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      const assistantMessage = { role: 'assistant' as const, content: data.reply };

      // Typewriter effect
      let displayed = '';
      const interval = setInterval(() => {
        if (displayed.length < assistantMessage.content.length) {
          displayed += assistantMessage.content[displayed.length];
          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs[newMsgs.length - 1]?.role === 'assistant') {
              newMsgs[newMsgs.length - 1].content = displayed;
            } else {
              newMsgs.push({ role: 'assistant', content: displayed });
            }
            return newMsgs;
          });
        } else {
          clearInterval(interval);
          setLoading(false);
        }
      }, 30);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant' as const, content: 'Sorry, something went wrong. Try again.' }]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400 p-6 z-50">
      <h2 className="text-4xl font-black text-cyan-400 glow-title text-center mb-4">
        AI Growth Coach
      </h2>

      {/* Messages */}
      <div className="max-w-4xl mx-auto max-h-60 overflow-y-auto mb-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`text-left ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-lg px-6 py-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-cyan-400/20 border border-cyan-400 text-cyan-200' 
                : 'bg-white/10 text-cyan-100'
            }`}>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block px-6 py-4 rounded-2xl bg-white/10">
              <p className="text-lg text-cyan-300">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {!messages.length && !loading && (
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap justify-center gap-4">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="text-cyan-300 text-lg px-6 py-3 rounded-full border border-cyan-400/50 hover:bg-cyan-400/20 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="max-w-4xl mx-auto flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about churn, revenue, growth..."
          className="flex-1 bg-transparent border-4 border-cyan-400 rounded-full px-8 py-5 text-xl text-cyan-200 placeholder-cyan-500 focus:outline-none glow-soft"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-cyan-400 text-black font-bold px-10 py-5 rounded-full text-2xl hover:bg-cyan-300 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}