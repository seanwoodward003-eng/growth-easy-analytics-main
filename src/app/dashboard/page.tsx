"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function Dashboard() {
  const { data } = useMetrics();

  return (
    <div className="space-y-16 pb-24 pt-8">
      {/* Header Title + Menu (visible on mobile too) */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-6xl md:text-8xl font-black text-cyber-neon glow-strong">
          GrowthEasy AI
        </h1>
        <button className="px-10 py-5 border-4 border-cyber-neon rounded-3xl text-3xl font-bold text-cyber-neon glow-medium bg-transparent hover:bg-cyber-neon hover:text-black transition">
          Menu
        </button>
      </div>

      {/* Demo Mode Notice */}
      <div className="bg-cyber-card/60 backdrop-blur-lg border-4 border-cyber-neon rounded-3xl p-12 text-center">
        <p className="text-4xl md:text-5xl font-bold text-cyber-neon glow-strong">
          AI: Demo mode - connect accounts for real data.
        </p>
      </div>

      {/* Profile */}
      <div className="bg-cyber-card/70 backdrop-blur-lg border-4 border-cyber-neon rounded-3xl p-12 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-cyber-neon glow-strong mb-8">
          Your Profile
        </h2>
        <p className="text-3xl md:text-4xl text-cyan-300 mb-10">
          {data?.user?.email || "seanwoodward23@gmail.com"}
        </p>
        <button className="px-16 py-6 border-4 border-cyber-neon rounded-full text-3xl font-bold text-cyber-neon glow-medium bg-transparent hover:bg-cyber-neon hover:text-black transition">
          Logout
        </button>
      </div>

      {/* Connect Accounts */}
      <IntegrationsSection />

      {/* BIG GLOWING BUBBLE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Revenue Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-xl border-6 border-cyber-neon rounded-3xl p-16 text-center shadow-2xl shadow-cyber-neon/70">
          <h3 className="text-5xl font-bold text-cyan-300 mb-8">Revenue</h3>
          <p className="text-8xl md:text-9xl font-black text-cyber-neon glow-strong">
            £{(data?.revenue?.total || 12700).toLocaleString()}
          </p>
          <p className="text-5xl md:text-6xl font-bold text-green-400 glow-medium mt-10">
            {data?.revenue?.trend || "+6%"} (demo)
          </p>
        </div>

        {/* Churn Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-xl border-6 border-red-500 rounded-3xl p-16 text-center shadow-2xl shadow-red-500/70">
          <h3 className="text-5xl font-bold text-cyan-300 mb-8">Churn Rate</h3>
          <p className="text-8xl md:text-9xl font-black text-red-400 glow-strong">
            {data?.churn?.rate || 3.2}%
          </p>
          <p className="text-4xl md:text-5xl text-red-300 mt-10">
            {data?.churn?.at_risk || 18} at risk
          </p>
        </div>

        {/* LTV:CAC Bubble */}
        <div className="bg-cyber-card/90 backdrop-blur-xl border-6 border-cyber-neon rounded-3xl p-16 text-center shadow-2xl shadow-cyber-neon/70">
          <h3 className="text-5xl font-bold text-cyan-300 mb-8">LTV:CAC</h3>
          <p className="text-9xl md:text-10xl font-black text-cyber-neon glow-strong">
            {data?.performance?.ratio || "3.0"}:1
          </p>
          <p className="text-5xl md:text-6xl font-bold text-green-400 glow-medium mt-10">
            Healthy
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-cyber-card/70 backdrop-blur-lg border-4 border-cyber-neon rounded-3xl p-12">
        <h3 className="text-5xl md:text-6xl font-black text-cyber-neon glow-strong text-center mb-12">
          Revenue Trend
        </h3>
        <RevenueChart />
      </div>

      {/* AI Growth Coach */}
      <AIGrowthCoach />
    </div>
  );
}