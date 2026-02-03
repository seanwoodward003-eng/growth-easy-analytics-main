'use client';

import { Paperclip, Image, Smile, Send } from 'lucide-react';

export default function AIGrowthCoachPage() {
  // No real useChat or state – everything static for demo
  // Keeping all your original UI structure intact

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0f2c]">
      {/* Cyberpunk network background – unchanged */}
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

      {/* Messages section – extra padding for input bar */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Demo mode notice */}
          <div className="text-center py-8 bg-gray-900/80 border border-cyan-500/30 rounded-2xl">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">AI Growth Coach (Demo)</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Real AI chat is disabled in demo mode. Below is a sample conversation to show how it works.
            </p>
          </div>

          {/* Static sample conversation – looks exactly like real chat */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {/* User avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                {/* Optional user icon if you have one */}
              </div>

              {/* User bubble */}
              <div className="flex flex-col items-start max-w-2xl">
                <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-900/80 to-cyan-900/80 text-white backdrop-blur-md border border-cyan-500/30">
                  {/* Tail */}
                  <div className="absolute top-0 w-0 h-0 border-8 border-transparent right-0 -mr-4 border-l-purple-900/80" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    How do I reduce churn from 12%?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {/* Grok avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>

              {/* Grok bubble */}
              <div className="flex flex-col items-start max-w-2xl">
                <p className="text-cyan-400 text-sm mb-2">Grok online</p>
                <div className="relative px-6 py-4 rounded-2xl bg-gray-800/90 text-cyan-100 backdrop-blur-md border border-cyan-500/30">
                  {/* Tail */}
                  <div className="absolute top-0 w-0 h-0 border-8 border-transparent left-0 -ml-4 border-r-gray-800/90" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    Target at-risk customers first with personalized win-back emails and discounts. Offer a 20% off coupon to the top 20% at-risk segment — retention emails have 30–40% open rates in Shopify stores. Track results in the Retention tab.
                  </p>
                </div>
              </div>
            </div>

            {/* Add more sample messages if you want – copy-paste the pattern */}
            <div className="flex items-start gap-4 flex-row-reverse">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                {/* User avatar again */}
              </div>
              <div className="flex flex-col items-end max-w-2xl">
                <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-900/80 to-cyan-900/80 text-white backdrop-blur-md border border-cyan-500/30">
                  <div className="absolute top-0 w-0 h-0 border-8 border-transparent right-0 -mr-4 border-l-purple-900/80" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    What’s my biggest revenue leak right now?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 163.53 163.53" fill="currentColor">
                  <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" />
                </svg>
              </div>
              <div className="flex flex-col items-start max-w-2xl">
                <p className="text-cyan-400 text-sm mb-2">Grok online</p>
                <div className="relative px-6 py-4 rounded-2xl bg-gray-800/90 text-cyan-100 backdrop-blur-md border border-cyan-500/30">
                  <div className="absolute top-0 w-0 h-0 border-8 border-transparent left-0 -ml-4 border-r-gray-800/90" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    Silent churn from inactive customers is costing you ~£3k/month. Re-engage with automated win-back flows and upsell bundles to active users. Check the Churn tab for at-risk segments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Note at bottom */}
          <p className="text-center text-cyan-500 mt-12 text-lg">
            Real AI chat coming soon – join the waiting list for early access!
          </p>
        </div>
      </div>

      {/* Input bar – disabled in demo mode */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-[#0a0f2c] to-transparent backdrop-blur-xl border-t border-cyan-400/30">
        <div className="max-w-4xl mx-auto flex items-center gap-3 opacity-60 pointer-events-none">
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Paperclip className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Image className="w-6 h-6 text-cyan-300" />
          </button>

          <input
            disabled
            placeholder="Message... (demo mode – real chat coming soon)"
            className="flex-1 bg-gray-800/70 text-white px-6 py-4 rounded-full border border-cyan-500/50 text-lg placeholder-cyan-400/60 backdrop-blur-md cursor-not-allowed"
          />

          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>
          <button type="button" disabled className="p-3 rounded-full bg-gray-800/50 border border-cyan-500/40 rotate-180">
            <Smile className="w-6 h-6 text-cyan-300" />
          </button>

          <button
            disabled
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-bold text-black flex items-center gap-2 shadow-lg shadow-cyan-500/50 opacity-50 cursor-not-allowed"
          >
            Send
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}