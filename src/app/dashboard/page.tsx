// src/app/dashboard/page.tsx
"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";

export default function Dashboard() {
  const { data, isLoading } = useMetrics();

  if (isLoading) {
    return <p className="text-center text-5xl text-cyber-neon glow-strong">Loading real-time data...</p>;
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <h1 className="text-7xl md:text-9xl font-black text-cyber-neon glow-strong glitch text-center mb-20">
        GrowthEasy AI
      </h1>

      <p className="text-center text-4xl text-cyber-neon glow-medium mb-20">
        AI: Demo mode - connect accounts for real data.
      </p>

      {/* Profile */}
      <div className="text-center mb-20">
        <h2 className="text-6xl text-cyber-neon glow-strong mb-8">Your Profile</h2>
        <p className="text-4xl mb-8">{data?.user?.email || "seanwoodward23@gmail.com"}</p>
        <button className="cyber-btn">Logout</button>
      </div>

      {/* Connections */}
      <IntegrationsSection />

      {/* Metric Bubbles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto my-20">
        <div className="metric-bubble">
          <h3 className="text-5xl text-cyan-300 mb-8">Revenue</h3>
          <p className="metric-value">£{(data?.revenue?.total || 12700).toLocaleString()}</p>
          <p className="text-5xl text-green-400 glow-medium mt-8">
            {data?.revenue?.trend || "+6%"} (demo)
          </p>
        </div>

        <div className="metric-bubble">
          <h3 className="text-5xl text-cyan-300 mb-8">Churn Rate</h3>
          <p className="metric-value">{data?.churn?.rate || 3.2}%</p>
          <p className="text-4xl text-red-300 mt-8">
            {data?.churn?.at_risk || 18} at risk
          </p>
        </div>

        <div className="metric-bubble">
          <h3 className="text-5xl text-cyan-300 mb-8">LTV:CAC</h3>
          <p className="metric-value">{data?.performance?.ratio || "3.4"}:1</p>
          <p className="text-5xl text-green-400 glow-medium mt-8">Healthy</p>
        </div>
      </div>

      {/* AI Growth Coach Chat Box */}
      <div className="max-w-5xl mx-auto ai-chat-box">
        <h2 className="text-7xl text-cyber-neon glow-strong glitch text-center mb-12">
          AI Growth Coach
        </h2>
        <AIGrowthCoach />
      </div>

      <div className="text-center mt-20">
        <p className="text-2xl text-cyan-300 glow-soft mb-4">Contact Terms Privacy</p>
        <p className="text-xl text-cyan-400 glow-soft">Beta v1.1 © 2025 GrowthEasy AI</p>
      </div>
    </div>
  );
}