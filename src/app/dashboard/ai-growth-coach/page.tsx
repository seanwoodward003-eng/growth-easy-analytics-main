'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip, Image, Smile, Send, Lock } from 'lucide-react';

export default function AIGrowthCoachPage() {
  const router = useRouter();
  const [messages] = useState([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your AI Growth Coach. How can I help you grow your business today?' },
    { id: '2', role: 'user', content: 'My churn rate is increasing. What should I do?' },
    { id: '3', role: 'assistant', content: 'Great question! First, let\'s look at your data. In demo mode I can show you a sample strategy:\n\n1. Identify at-risk customers (last 30 days inactive)\n2. Send personalized win-back email with discount\n3. Add onboarding checklist for new users\n\nFull version gives real-time data + custom playbooks.' },
    { id: '4', role: 'user', content: 'How do I reduce churn long-term?' },
    { id: '5', role: 'assistant', content: 'Long-term churn reduction strategies include:\n- Improving onboarding experience\n- Building customer success touchpoints\n- Regular NPS surveys\n- Proactive support\n\nUpgrade to unlock personalized analysis and weekly growth recommendations.' },
  ]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0f2c]">
      {/* Cyberpunk network background */}
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

      {/* Header with lock icon */}
      <div className="relative z-10 bg-gradient-to-r from-[#0a0f2c] to-black border-b border-cyan-400/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
              <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-cyan-300">AI Growth Coach</h1>
        </div>
        <div className="flex items-center gap-2 bg-red-900/40 px-4 py-2 rounded-full border border-red-500/50">
          <Lock className="w-5 h-5 text-red-400" />
          <span className="text-red-300 font-medium">Demo Mode</span>
        </div>
      </div>

      {/* Demo messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
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
                {m.role === 'assistant' && <p className="text-cyan-400 text-sm mb-2">Grok Demo</p>}
                <div className={`relative px-6 py-4 rounded-2xl ${m.role === 'user' ? 'bg-gradient-to-r from-purple-900/80 to-cyan-900/80 text-white' : 'bg-gray-800/90 text-cyan-100'} backdrop-blur-md border border-cyan-500/30`}>
                  <div className={`absolute top-0 w-0 h-0 border-8 border-transparent ${m.role === 'user' ? 'right-0 -mr-4 border-l-purple-900/80' : 'left-0 -ml-4 border-r-gray-800/90'}`} />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Upgrade prompt at the end of demo */}
          <div className="text-center py-12">
            <div className="inline-block bg-gradient-to-r from-cyan-900/50 to-purple-900/50 p-8 rounded-3xl border-2 border-cyan-500/40 max-w-xl">
              <Lock className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
              <h2 className="text-3xl font-bold text-cyan-300 mb-4">This is just a demo</h2>
              <p className="text-xl text-cyan-200 mb-8">
                Unlock the full AI Growth Coach for real-time data analysis, personalized strategies, daily recommendations, and unlimited chat.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-cyan-400 text-black font-bold px-12 py-5 rounded-xl text-2xl hover:scale-105 transition shadow-lg shadow-cyan-500/50"
              >
                Unlock Full Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled input bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-[#0a0f2c] to-transparent backdrop-blur-xl border-t border-cyan-400/30">
        <div className="max-w-4xl mx-auto flex items-center gap-3 opacity-60 pointer-events-none">
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Paperclip className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Image className="w-6 h-6 text-cyan-300" />
          </button>

          <input
            placeholder="Message... (demo mode - chat disabled)"
            className="flex-1 bg-gray-800/40 text-gray-400 px-6 py-4 rounded-full border border-cyan-500/30 text-lg placeholder-cyan-500/60 backdrop-blur-md cursor-not-allowed"
            disabled
          />

          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 rotate-180">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>

          <button
            type="button"
            disabled
            className="px-8 py-4 bg-gradient-to-r from-cyan-500/50 to-cyan-400/50 rounded-full font-bold text-black flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-not-allowed"
          >
            Send
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}