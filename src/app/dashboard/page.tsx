"use client";

import useMetrics from "@/hooks/useMetrics";
import { IntegrationsSection } from "@/components/IntegrationsSection";
import { AIGrowthCoach } from "@/components/chat/AIGrowthCoach";
import { RevenueChart } from "@/components/charts/RevenueChart";


export default function Dashboard() {
  return (
    <div className="px-6 max-w-5xl mx-auto">
      {/* Connect Accounts Section */}
      <div className="text-center mt-12 mb-20">
        <h2 className="text-5xl md:text-7xl font-bold text-cyan-400 glow mb-8">
          Connect Your Accounts
        </h2>
        <p className="text-2xl md:text-4xl text-cyan-200 mb-12">
          Shopify, GA4, HubSpot – real data powers AI insights.
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <button className="bg-white/10 backdrop-blur-md border-2 border-cyan-400 text-cyan-300 px-10 py-6 rounded-full text-2xl md:text-3xl font-medium hover:bg-cyan-400/20 transition">
            Connect Shopify
          </button>
          <button className="bg-white/10 backdrop-blur-md border-2 border-cyan-400 text-cyan-300 px-10 py-6 rounded-full text-2xl md:text-3xl font-medium hover:bg-cyan-400/20 transition">
            Connect GA4
          </button>
          <button className="bg-white/10 backdrop-blur-md border-2 border-cyan-400 text-cyan-300 px-10 py-6 rounded-full text-2xl md:text-3xl font-medium hover:bg-cyan-400/20 transition">
            Connect HubSpot
          </button>
        </div>

        <p className="text-2xl md:text-3xl text-cyan-300">Checking connections...</p>
      </div>

      {/* Metric Cards */}
      <div className="space-y-16">
        {/* Revenue */}
        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-cyan-400 rounded-3xl p-12 md:p-16 text-center">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">Revenue</h3>
          <p className="text-7xl md:text-9xl font-bold text-cyan-400 glow">£12,700</p>
          <p className="text-4xl md:text-6xl text-cyan-300 mt-8">+6% (demo)</p>
        </div>

        {/* Churn Rate */}
        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-cyan-400 rounded-3xl p-12 md:p-16 text-center">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">Churn Rate</h3>
          <p className="text-7xl md:text-9xl font-bold text-cyan-400 glow">3.2%</p>
          <p className="text-4xl md:text-6xl text-yellow-400 mt-8">18 at risk</p>
        </div>

        {/* LTV:CAC */}
        <div className="bg-[#0f1a3d]/80 backdrop-blur-md border-2 border-cyan-400 rounded-3xl p-12 md:p-16 text-center">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">LTV:CAC</h3>
          <p className="text-8xl md:text-10xl font-bold text-cyan-400 glow">3.4:1</p>
          <p className="text-4xl md:text-5xl text-green-400 mt-8">Healthy</p>
        </div>
      </div>

      {/* AI Growth Coach - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f2c]/95 backdrop-blur-md border-t-2 border-cyan-400 p-6 text-center">
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">AI Growth Coach</h3>
        <p className="text-xl md:text-2xl text-cyan-200 mb-6">
          Hi! I'm your AI Growth Coach. Ask me anything about churn, revenue, acquisition...
        </p>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Ask about churn, revenue..."
            className="w-full md:flex-1 bg-transparent border-2 border-cyan-400 rounded-full px-8 py-5 text-xl md:text-2xl text-cyan-200 placeholder-cyan-500 focus:outline-none"
          />
          <button className="bg-cyan-400 text-black font-bold px-12 py-5 rounded-full text-xl md:text-2xl hover:bg-cyan-300 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}