'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-start pt-8 pb-32 px-4 text-center relative overflow-hidden">
      {/* Optional subtle animated background glow (keeps cyberpunk feel) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#00f0ff33_0%,transparent_40%)] animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#c300ff33_0%,transparent_40%)] animate-pulse-slower"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto z-10 w-full mt-12 md:mt-20">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 md:mb-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent glow-title tracking-tight">
          GROWTHEASY AI
        </h1>
        <p className="text-3xl md:text-5xl font-bold text-cyan-300 mb-6 md:mb-10">
          AI-Powered Growth Intelligence for Your Store
        </p>
        <p className="text-xl md:text-2xl lg:text-3xl text-cyan-200 max-w-5xl mx-auto mb-12 md:mb-20 leading-relaxed">
          Connect your Shopify store and get real-time insights on revenue, churn, acquisition, retention — with an AI Growth Coach that reads your actual data and tells you exactly what to fix to make more money.
        </p>

        {/* Big non-auth CTAs – very prominent */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-center mb-20 md:mb-32">
          <Link href="/dashboard">
            <button className="px-16 md:px-24 py-8 md:py-10 bg-gradient-to-r from-cyan-500 via-cyan-400 to-purple-600 text-black text-3xl md:text-5xl font-black rounded-full hover:scale-105 hover:shadow-[0_0_60px_#00f0ff] transition-all duration-300 shadow-2xl shadow-cyan-600/60">
              Enter Dashboard →
            </button>
          </Link>

          <Link href="/pricing">
            <button className="px-16 md:px-24 py-8 md:py-10 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 text-white text-3xl md:text-5xl font-black rounded-full hover:scale-105 hover:shadow-[0_0_60px_#c300ff] transition-all duration-300 shadow-2xl shadow-purple-600/60">
              See Lifetime Deals
            </button>
          </Link>
        </div>

        {/* Urgency – kept very visible */}
        <div className="space-y-6 md:space-y-8 mb-16 md:mb-24">
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-red-400 animate-pulse tracking-wide">
            Only 200 Early Bird lifetime spots left at £49
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-400">
            Lifetime access closes forever at 500 — spots disappearing fast
          </p>
        </div>

        {/* Features Grid – unchanged, looks great */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto mb-16 md:mb-24">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-cyan-900/25 to-purple-900/20 border border-cyan-500/40 backdrop-blur-md hover:border-cyan-400/60 transition-all duration-300">
            <h3 className="text-3xl font-black text-cyan-300 mb-6">Real-Time Analytics</h3>
            <p className="text-xl text-cyan-100 leading-relaxed">
              Revenue, churn, acquisition, retention — all updated live from your connected stores.
            </p>
          </div>
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-purple-900/25 to-pink-900/20 border border-purple-500/40 backdrop-blur-md hover:border-purple-400/60 transition-all duration-300">
            <h3 className="text-3xl font-black text-purple-300 mb-6">AI Growth Coach</h3>
            <p className="text-xl text-purple-100 leading-relaxed">
              Ask anything — Grok reads your actual data and gives specific, actionable advice to grow faster.
            </p>
          </div>
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-pink-900/25 to-cyan-900/20 border border-pink-500/40 backdrop-blur-md hover:border-pink-400/60 transition-all duration-300">
            <h3 className="text-3xl font-black text-pink-300 mb-6">Cyberpunk Design</h3>
            <p className="text-xl text-pink-100 leading-relaxed">
              Beautiful neon interface that makes checking your growth feel addictive.
            </p>
          </div>
        </div>

        {/* Pricing Preview – kept bold and attractive */}
        <div className="max-w-6xl mx-auto mb-16 md:mb-24">
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-cyan-400 mb-10 md:mb-16 tracking-tight">
            Lock In Lifetime Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-cyan-900/40 to-black border-4 border-cyan-500 shadow-[0_0_40px_#00f0ff33] hover:shadow-[0_0_60px_#00f0ff66] transition-all duration-300">
              <p className="text-6xl font-black text-cyan-400 mb-4">£49</p>
              <p className="text-2xl text-red-400 mb-6 font-bold">Early Bird • 200 left</p>
              <p className="text-xl text-cyan-200">One-time payment</p>
            </div>
            <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-900/40 to-black border-4 border-purple-500 shadow-[0_0_40px_#c300ff33] hover:shadow-[0_0_60px_#c300ff66] transition-all duration-300">
              <p className="text-6xl font-black text-purple-400 mb-4">£79</p>
              <p className="text-2xl text-purple-300 mb-6 font-bold">Lifetime • Closes at 500</p>
              <p className="text-xl text-purple-200">One-time payment</p>
            </div>
            <div className="p-10 rounded-3xl bg-gradient-to-br from-green-900/40 to-black border-4 border-green-500 shadow-[0_0_40px_#00ff9f33] hover:shadow-[0_0_60px_#00ff9f66] transition-all duration-300">
              <p className="text-6xl font-black text-green-400 mb-4">£490/year</p>
              <p className="text-2xl text-green-300 mb-6 font-bold">Annual • Save 16%</p>
              <p className="text-xl text-green-200">≈ £41/mo</p>
            </div>
          </div>
          <p className="text-2xl text-cyan-300 mt-12 font-bold">
            Instant activation — no waiting, no approval
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 left-0 right-0 text-center text-cyan-500 text-base md:text-lg space-x-6 md:space-x-10">
        <a href="/privacy" className="hover:text-cyan-300 hover:underline transition">Privacy Policy</a>
        <a href="/terms" className="hover:text-cyan-300 hover:underline transition">Terms of Service</a>
        <p className="mt-6 text-cyan-600">
          Beta v0.1 © 2026 GrowthEasy AI
        </p>
      </footer>
    </main>
  );
}