"use client";

// src/app/dashboard/page.tsx
import useMetrics from "@/hooks/useMetrics";
import IntegrationsSection from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function Dashboard() {
  const { data, isLoading } = useMetrics();

  return (
    <div className="space-y-16 pb-20">
      {/* Profile Section */}
      <div className="bg-cyber-card/60 border-2 border-cyber-neon rounded-3xl p-10">
        <h2 className="text-4xl font-bold text-cyber-neon mb-6">Your Profile</h2>
        <p className="text-2xl text-cyan-300 mb-6">
          {data?.user?.email || "seanwoodward23@gmail.com"}
        </p>
        <button className="bg-transparent border-2 border-cyber-neon text-cyber-neon px-10 py-4 rounded-full text-xl font-bold hover:bg-cyber-neon hover:text-black transition">
          Logout
        </button>
      </div>

      {/* OAuth Connect Buttons */}
      <IntegrationsSection />

      {/* Big Glowing Metric Bubbles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Revenue */}
        <div className="bg-cyber-card/80 backdrop-blur-md border-2 border-cyber-neon rounded-3xl p-12 text-center shadow-2xl shadow-cyber-neon/40">
          <h3 className="text-3xl text-cyan-400 mb-6">Revenue</h3>
          <p className="text-7xl font-bold text-cyber-neon">
            £{(data?.revenue?.total || 12700).toLocaleString()}
          </p>
          <p className="text-4xl text-green-400 mt-6">
            {data?.revenue?.trend || "+6%"} (demo)
          </p>
        </div>

        {/* Churn Rate */}
        <div className="bg-cyber-card/80 backdrop-blur-md border-2 border-red-500 rounded-3xl p-12 text-center shadow-2xl shadow-red-500/40">
          <h3 className="text-3xl text-cyan-400 mb-6">Churn Rate</h3>
          <p className="text-7xl font-bold text-red-400">
            {data?.churn?.rate || 3.2}%
          </p>
          <p className="text-3xl text-red-300 mt-6">
            {data?.churn?.at_risk || 18} at risk
          </p>
        </div>

        {/* LTV:CAC */}
        <div className="bg-cyber-card/80 backdrop-blur-md border-2 border-cyber-neon rounded-3xl p-12 text-center shadow-2xl shadow-cyber-neon/40">
          <h3 className="text-3xl text-cyan-400 mb-6">LTV:CAC</h3>
          <p className="text-8xl font-bold text-cyber-neon">
            {data?.performance?.ratio || "3.0"}:1
          </p>
          <p className="text-3xl text-green-400 mt-6">Healthy</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <RevenueChart />

      {/* AI Growth Coach Chat */}
      <AIGrowthCoach />
    </div>
  );
}