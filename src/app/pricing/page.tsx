'use client';

import { useState } from 'react';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');

  return (
    <div className="min-h-screen px-4 py-20 md:px-12 lg:px-24 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      <h1 className="glow-title text-center text-7xl md:text-9xl font-black mb-20 text-cyan-400">
        Pricing
      </h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* One-time Plan */}
          <div className="metric-card p-8 rounded-2xl text-center border-2 border-cyan-500/30 hover:border-cyan-400 transition">
            <h2 className="text-4xl font-black text-cyan-300 mb-4">One-time</h2>
            <p className="text-5xl font-black text-green-400 mb-6">£49</p>
            <p className="text-xl text-gray-300 mb-8">Lifetime Access</p>

            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Full AI Growth Coach
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Real-time metrics
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Unlimited queries
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Future updates
              </li>
            </ul>

            {/* Disabled Buy Button */}
            <div className="relative opacity-60 pointer-events-none group">
              <button className="w-full p-5 bg-cyan-500 text-black rounded-xl font-bold text-xl cursor-not-allowed">
                Buy Now – £49
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl">
                <span className="text-white text-sm font-medium px-4 py-2 bg-gray-900/80 rounded">
                  Demo mode – coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="metric-card p-8 rounded-2xl text-center border-2 border-purple-500/30 hover:border-purple-400 transition">
            <h2 className="text-4xl font-black text-purple-300 mb-4">Monthly</h2>
            <p className="text-5xl font-black text-green-400 mb-6">£29/mo</p>
            <p className="text-xl text-gray-300 mb-8">Cancel anytime</p>

            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> All features
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Priority support
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Monthly updates
              </li>
            </ul>

            {/* Disabled Subscribe Button */}
            <div className="relative opacity-60 pointer-events-none group">
              <button className="w-full p-5 bg-purple-500 text-black rounded-xl font-bold text-xl cursor-not-allowed">
                Subscribe – £29/mo
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl">
                <span className="text-white text-sm font-medium px-4 py-2 bg-gray-900/80 rounded">
                  Demo mode – coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Lifetime Plan */}
          <div className="metric-card p-8 rounded-2xl text-center border-2 border-cyan-500/50 hover:border-cyan-400 transition relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-6 py-2 rounded-full font-bold text-xl">
              Most Popular
            </div>
            <h2 className="text-4xl font-black text-cyan-300 mb-4 mt-8">Lifetime</h2>
            <p className="text-5xl font-black text-green-400 mb-6">£149</p>
            <p className="text-xl text-gray-300 mb-8">One-time payment</p>

            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Everything in One-time
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> Priority updates
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> VIP support
              </li>
            </ul>

            {/* Disabled Lifetime Button */}
            <div className="relative opacity-60 pointer-events-none group">
              <button className="w-full p-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-black rounded-xl font-bold text-xl cursor-not-allowed">
                Get Lifetime – £149
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl">
                <span className="text-white text-sm font-medium px-4 py-2 bg-gray-900/80 rounded">
                  Demo mode – coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ or other content – add if you have it */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-4xl font-bold text-cyan-400 mb-8">Questions?</h2>
        <p className="text-xl text-gray-300">
          Drop us a line or join the waiting list for updates.
        </p>
      </div>
    </div>
  );
}