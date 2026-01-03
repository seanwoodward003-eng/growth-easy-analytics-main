'use client';

import useMetrics from "@/hooks/useMetrics";
import { PerformanceChart } from "@/components/charts/PerformanceChart";


export default function PerformancePage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

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

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <PerformanceChart />
      </div>

    
    </div>
  );
}