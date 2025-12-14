"use client";

import { useState } from "react";

export function AIGrowthCoach() {
  const [messages, setMessages] = useState<Array<{ type: "user" | "ai"; text: string }>>([
    { type: "ai", text: "Hi! I'm your AI Growth Coach. Ask me anything about churn, revenue, acquisition..." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://growth-easy-analytics-2.onrender.com/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: "ai", text: data.reply || "Thinking..." }]);
    } catch {
      setMessages(prev => [...prev, { type: "ai", text: "Connection issue – try again soon." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-10 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold text-[#00ffff] text-center mb-8">AI Growth Coach</h2>

      <div className="bg-black/50 border border-[#00ffff]/50 rounded-2xl p-6 h-96 overflow-y-auto mb-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-lg px-6 py-4 rounded-2xl ${msg.type === "user" ? "bg-[#00ffff] text-black ml-auto" : "bg-cyan-900/60 text-cyan-100"}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-cyan-400 text-center">Thinking...</div>}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about churn, revenue, SEO..."
          className="flex-1 bg-black/60 border-2 border-[#00ffff] rounded-full px-8 py-5 text-xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-[#00ffff] text-black px-12 py-5 rounded-full text-xl font-bold hover:scale-105 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}