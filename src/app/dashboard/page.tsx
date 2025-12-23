'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";
import Link from 'next/link';

export default function Dashboard() {
  const { metrics, isLoading, isConnected } = useMetrics();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      {!isConnected && (
        <div className="text-center mb-12">
          <p className="text-3xl text-cyan-300 glow-medium mb-4">
            {isLoading ? "Loading..." : "Demo mode — connect accounts for real data"}
          </p>
        </div>
      )}

      <h2 className="glow-title text-center text-6xl md:text-8xl font-bold mb-16">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        <div className="metric-bubble">
          <h3 className="text-4xl font-bold text-cyan-300 mb-4">Revenue</h3>
          <p className="metric-value">£{metrics.revenue.total.toLocaleString()}</p>
          <p className="text-3xl text-green-400 mt-6 glow-medium">{metrics.revenue.trend}</p>
        </div>
        <div className="metric-bubble">
          <h3 className="text-4xl font-bold text-cyan-300 mb-4">Churn Rate</h3>
          <p className="metric-value text-red-400">{metrics.churn.rate}%</p>
          <p className="text-3xl text-red-400 mt-6 glow-medium">{metrics.churn.at_risk} at risk</p>
        </div>
        <div className="metric-bubble">
          <h3 className="text-4xl font-bold text-cyan-300 mb-4">LTV:CAC</h3>
          <p className="metric-value text-green-400">{metrics.performance.ratio}:1</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <RevenueChart />
      </div>

      <div className="text-center mb-20">
        <h3 className="text-5xl font-bold text-cyan-400 mb-8">Connect Your Accounts</h3>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => {
            const shop = prompt("Enter your .myshopify.com domain");
            if (shop) window.location.href = `/api/auth/shopify?shop=${shop}`;
          }} className="cyber-btn text-2xl px-10 py-5">
            Connect Shopify
          </button>
          <button onClick={() => window.location.href = '/api/auth/ga4'} className="cyber-btn text-2xl px-10 py-5">
            Connect GA4
          </button>
          <button onClick={() => window.location.href = '/api/auth/hubspot'} className="cyber-btn text-2xl px-10 py-5">
            Connect HubSpot
          </button>
        </div>
      </div>

      <AIInsights />
    </div>
  );
}