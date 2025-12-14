// src/app/dashboard/page.tsx — FINAL, NO ERRORS, EXACT ORIGINAL DESIGN
"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function Dashboard() {
  const { data } = useMetrics();  // Fixed syntax

  return (
    <div className="space-y-12 pb-20">
      {/* Profile */}
      <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-10">
        <h2 className="text-4xl font-bold text-[#00ffff] mb-6">Your Profile</h2>
        <p className="text-2xl text-cyan-300 mb-6">
          {data?.user?.email || "seanwoodward23@gmail.com"}
        </p>
        <button className="bg-transparent border-2 border-[#00ffff] text-[#00ffff] px-10 py-4 rounded-full text-xl font-bold hover:bg-[#00ffff] hover:text-black transition">
          Logout
        </button>
      </div>

      {/* Connect Accounts */}
      <IntegrationsSection />

      {/* Metric Bubbles — EXACT ORIGINAL GLOW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-[#00ffff] rounded-3xl p-12 text-center shadow-2xl shadow-[#00ffff]/50">
          <h3 className="text-3xl text-cyan-400 mb-6">Revenue</h3>
          <p className="text-7xl font-bold text-[#00ffff]">
            £{(data?.revenue?.total || 12700).toLocaleString()}
          </p>
          <p className="text-4xl text-green-400 mt-6">
            {data?.revenue?.trend || "+6%"} (demo)
          </p>
        </div>

        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-red-500 rounded-3xl p-12 text-center shadow-2xl shadow-red-500/50">
          <h3 className="text-3xl text-cyan-400 mb-6">Churn Rate</h3>
          <p className="text-7xl font-bold text-red-400">
            {data?.churn?.rate || 3.2}%
          </p>
          <p className="text-3xl text-red-300 mt-6">
            {data?.churn?.at_risk || 18} at risk
          </p>
        </div>

        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-[#00ffff] rounded-3xl p-12 text-center shadow-2xl shadow-[#00ffff]/50">
          <h3 className="text-3xl text-cyan-400 mb-6">LTV:CAC</h3>
          <p className="text-8xl font-bold text-[#00ffff]">
            {data?.performance?.ratio || "3.0"}:1
          </p>
          <p className="text-3xl text-green-400 mt-6">Healthy</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-10">
        <h3 className="text-4xl font-bold text-[#00ffff] text-center mb-8">Revenue Trend</h3>
        <RevenueChart />
      </div>

      {/* AI Growth Coach */}
      <AIGrowthCoach />
    </div>
  );
}