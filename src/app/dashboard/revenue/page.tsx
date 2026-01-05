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
      </div>

      {/* NEW: AOV Section */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">Average Order Value (AOV)</h2>
        <div className="metric-card p-10 text-center">
          <p className="text-7xl font-black text-green-400 mb-4">£{metrics.aov?.toFixed(2) || '0.00'}</p>
          <p className="text-2xl text-cyan-200">Increase AOV with bundles and upsells</p>
        </div>
        {/* Add AOV chart here if you have one */}
      </div>

      {/* NEW: LTV Breakdown */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">LTV Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">New Customers</h3>
            <p className="text-6xl font-black text-yellow-400">£{metrics.ltvNew?.toFixed(0) || '0'}</p>
          </div>
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Returning Customers</h3>
            <p className="text-6xl font-black text-green-400">£{metrics.ltvReturning?.toFixed(0) || '0'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <RevenueChart />
      </div>
    </div>
  );
}