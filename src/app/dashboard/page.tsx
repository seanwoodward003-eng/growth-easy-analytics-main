// src/app/dashboard/page.tsx
"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";

export default function Dashboard() {
  const { data } = useMetrics();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12 space-y-16">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-7xl md:text-9xl font-black text-cyber-neon glow-strong glitch">
          GrowthEasy AI
        </h1>
        <button className="px-12 py-6 border-6 border-cyber-neon rounded-3xl text-4xl font-bold text-cyber-neon glow-medium bg-transparent hover:bg-cyber-neon hover:text-black transition">
          Menu
        </button>
      </div>

      {/* Demo Mode Notice */}
      <div className="w-full max-w-5xl bg-cyber-card/70 backdrop-blur-xl border-6 border-cyber-neon rounded-3xl p-16 text-center">
        <p className="text-5xl md:text-6xl font-bold text-cyber-neon glow-strong">
          AI: Demo mode - connect accounts for real data.
        </p>
      </div>

      {/* Profile + Connections */}
      <div className="w-full max-w-5xl space-y-12">
        <div className="bg-cyber-card/70 backdrop-blur-xl border-6 border-cyber-neon rounded-3xl p-16 text-center">
          <h2 className="text-6xl md:text-7xl font-black text-cyber-neon glow-strong mb-10">
            Your Profile
          </h2>
          <p className="text-4xl text-cyan-200 mb-12">
            {data?.user?.email || "seanwoodward23@gmail.com"}
          </p>
          <button className="px-20 py-8 border-6 border-cyber-neon rounded-full text-4xl font-bold text-cyber-neon glow-medium bg-transparent hover:bg-cyber-neon hover:text-black transition">
            Logout
          </button>
        </div>

        <IntegrationsSection />
      </div>

      {/* Massive Glowing Bubble Metrics */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Revenue Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-2xl border-8 border-cyber-neon rounded-3xl p-20 text-center shadow-2xl shadow-cyber-neon/80">
          <h3 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-10">Revenue</h3>
          <p className="text-8xl md:text-9xl font-black text-cyber-neon glow-strong">
            £{(data?.revenue?.total || 12700).toLocaleString()}
          </p>
          <p className="text-6xl md:text-7xl font-bold text-green-400 glow-medium mt-12">
            {data?.revenue?.trend || "+6%"} (demo)
          </p>
        </div>

        {/* Churn Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-2xl border-8 border-red-500 rounded-3xl p-20 text-center shadow-2xl shadow-red-500/80">
          <h3 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-10">Churn Rate</h3>
          <p className="text-8xl md:text-9xl font-black text-red-400 glow-strong">
            {data?.churn?.rate || 3.2}%
          </p>
          <p className="text-5xl md:text-6xl text-red-300 mt-12">
            {data?.churn?.at_risk || 18} at risk
          </p>
        </div>

        {/* LTV:CAC Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-2xl border-8 border-cyber-neon rounded-3xl p-20 text-center shadow-2xl shadow-cyber-neon/80">
          <h3 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-10">LTV:CAC</h3>
          <p className="text-9xl md:text-10xl font-black text-cyber-neon glow-strong">
            {data?.performance?.ratio || "3.4"}:1
          </p>
          <p className="text-6xl md:text-7xl font-bold text-green-400 glow-medium mt-12">
            Healthy
          </p>
        </div>
      </div>

      {/* AI Growth Coach — Big Centered Card */}
      <div className="w-full max-w-5xl bg-cyber-card/80 backdrop-blur-2xl border-8 border-cyber-neon rounded-3xl p-20 text-center">
        <h2 className="text-7xl md:text-9xl font-black text-cyber-neon glow-strong mb-20 glitch">
          AI Growth Coach
        </h2>
        <AIGrowthCoach />
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl text-center mt-20">
        <p className="text-2xl text-cyan-300 glow-soft mb-4">Contact Terms Privacy</p>
        <p className="text-xl text-cyan-400 glow-soft">Beta v1.1 © 2025 GrowthEasy AI</p>
      </div>
    </div>
  );
}