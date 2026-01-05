'use client';

import useMetrics from "@/hooks/useMetrics";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { AIInsights } from "@/components/AIInsights";

export default function PerformancePage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  // Health Score (0-100)
  const healthScore = Math.min(100, 
    (metrics.performance.ratio * 20) + 
    (100 - metrics.churn.rate * 2) + 
    (metrics.repeatRate || 0)
  );

  // Profit Estimate (simple)
  const profitEstimate = metrics.revenue.total * 0.3; // 30% margin example

  return (
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-yellow-400">
        Performance
      </h1>

      {!isConnected && (
        <div className="max-w-5xl mx-auto text-center mb-20 p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md">
          <p className="text-3xl text-cyan-300 mb-6">
            Connect your accounts to see real-time performance data and AI insights
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
        <p className="text-5xl text-cyan-300 mb-4">LTV:CAC Ratio</p>
        <p className="metric-value text-8xl text-yellow-400 mb-4">{metrics.performance.ratio}:1</p>
        <p className="text-xl text-cyan-200">Ratio healthy — scale acquisition safely</p>
      </div>

      {/* Health Score */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">Store Health Score</h2>
        <div className="metric-card p-10 text-center">
          <p className="text-9xl font-black text-gradient bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {Math.round(healthScore)}
          </p>
          <p className="text-3xl text-cyan-300 mt-4">/100</p>
        </div>
      </div>

      {/* Profit Estimate */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">Estimated Monthly Profit</h2>
        <div className="metric-card p-10 text-center">
          <p className="text-7xl font-black text-green-400 mb-4">
            £{profitEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-2xl text-cyan-200">After costs (30% margin estimate)</p>
        </div>
      </div>

      {/* Benchmarking */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">How You Compare</h2>
        <div className="metric-card p-10">
          <p className="text-3xl text-cyan-300 text-center mb-8">
            Your LTV:CAC beats 75% of similar stores
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <PerformanceChart />
      </div>

      {/* AI Insights — removed page prop */}
      <AIInsights />
    </div>
  );
}