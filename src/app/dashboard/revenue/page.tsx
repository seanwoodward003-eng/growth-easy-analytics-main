'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";


export default function RevenuePage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-green-400">
        Revenue
      </h1>

      {!isConnected && (
        <div className="max-w-5xl mx-auto text-center mb-20 p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md">
          <p className="text-3xl text-cyan-300 mb-6">
            Connect your accounts to see real-time revenue data and AI insights
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <button onClick={() => window.location.href = '/api/auth/shopify'} className="cyber-btn text-2xl px-10 py-5">
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
      )}

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Total Revenue</p>
        <p className="metric-value text-8xl text-green-400 mb-4">£{metrics.revenue.total.toLocaleString()}</p>
        <p className="text-5xl text-green-400 mb-4">{metrics.revenue.trend}</p>
        <p className="text-xl text-cyan-200">Revenue growing — focus on retention to sustain</p>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <RevenueChart />
      </div>

      
    </div>
  );
}