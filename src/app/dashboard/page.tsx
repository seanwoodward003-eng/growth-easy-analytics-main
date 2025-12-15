"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function Dashboard() {
  const { data } = useMetrics();

  return (
    <div className="space-y-16">
      {/* Top Title + Menu (exact old) */}
      <div className="flex justify-between items-center">
        <h1 className="text-7xl md:text-9xl font-black text-[#00ffff] glow-title">GrowthEasy AI</h1>
        <button className="neon-btn text-3xl">Menu</button>
      </div>

      {/* Demo Notice (exact old) */}
      <div className="neon-card">
        <p className="text-4xl md:text-5xl font-bold text-[#00ffff] glow-strong">
          AI: Demo mode – connect accounts for real data.
        </p>
      </div>

      {/* Profile (exact old) */}
      <div className="neon-card">
        <h3 className="text-5xl font-bold text-[#00ffff] glow-strong mb-8">Your Profile</h3>
        <p className="text-3xl text-cyan-200 mb-10">
          {data?.user?.email || "seanwoodward23@gmail.com"}
        </p>
        <button className="neon-btn text-2xl">Logout</button>
      </div>

      {/* Connect Accounts (your component will inherit neon style) */}
      <IntegrationsSection />

      {/* Revenue Trend Chart (keep your modern chart) */}
      <div className="neon-card">
        <h3 className="text-5xl font-bold text-[#00ffff] glow-strong text-center mb-8">Revenue Trend</h3>
        <RevenueChart />
      </div>

      {/* Big Metric Bubbles (exact old look) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="metric-bubble">
          <h3 className="text-4xl text-[#00ffff] glow-medium mb-6">Revenue</h3>
          <p className="text-7xl font-black text-[#00ffff] glow-strong">
            £{(data?.revenue?.total || 12700).toLocaleString()}
          </p>
          <p className="text-5xl text-green-400 glow-medium mt-8">+6% (demo)</p>
        </div>
        <div className="metric-bubble">
          <h3 className="text-4xl text-[#00ffff] glow-medium mb-6">Churn Rate</h3>
          <p className="text-7xl font-black text-red-400 glow-strong">
            {data?.churn?.rate || 3.2}%
          </p>
          <p className="text-4xl text-yellow-300 mt-8">{data?.churn?.at_risk || 18} at risk</p>
        </div>
        <div className="metric-bubble">
          <h3 className="text-4xl text-[#00ffff] glow-medium mb-6">LTV:CAC</h3>
          <p className="text-8xl font-black text-[#00ffff] glow-strong">
            {data?.performance?.ratio || "3"}:1
          </p>
          <p className="text-5xl text-green-400 glow-medium mt-8">Healthy</p>
        </div>
      </div>

      {/* Massive AI Growth Coach Panel (exact old bottom-panel) */}
      <div className="ai-coach-panel">
        <h3 className="text-6xl md:text-8xl font-black text-[#00ffff] glow-strong text-center mb-12">
          AI Growth Coach
        </h3>
        <AIGrowthCoach />
      </div>

      {/* Footer (exact old) */}
      <div className="text-center mt-16">
        <p className="text-xl text-cyan-300 glow-medium">Contact Terms Privacy</p>
        <p className="text-lg text-cyan-400 glow-medium">Beta v1.1 © 2025 GrowthEasy AI</p>
      </div>
    </div>
  );
}