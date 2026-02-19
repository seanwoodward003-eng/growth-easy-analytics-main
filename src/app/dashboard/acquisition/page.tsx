'use client';

import useMetrics from "@/hooks/useMetrics";
import { AcquisitionChart } from "@/components/charts/AcquisitionChart";
import { CostTrendChart } from "@/components/charts/CostTrendChart";
import { useAuthenticatedFetch } from '@/lib/authenticatedFetch';

export default function AcquisitionPage() {
  const authenticatedFetch = useAuthenticatedFetch(); // This sends Bearer session token

  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    hasRealData 
  } = useMetrics(); // If this hook still uses plain fetch, update it next (see below)

  // Optional: If useMetrics doesn't handle tokens yet, you can override fetches here
  // For now assuming the hook needs update – we'll do that after

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Acquisition heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-cyan-400">
        Acquisition
      </h1>

      {/* Traffic & Bounce Rate Cards – compact to save space */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        <div className="metric-card p-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-3">Sessions (Last 30 Days)</h3>
          <p className="text-5xl md:text-6xl font-black text-cyan-400 mb-2">
            {metrics.traffic?.sessions?.toLocaleString() || '0'}
          </p>
          <p className="text-lg text-cyan-200">
            {ga4Connected ? 'From GA4' : 'Connect GA4 to unlock real traffic data'}
          </p>
        </div>

        <div className="metric-card p-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-3">Bounce Rate</h3>
          <p className="text-5xl md:text-6xl font-black text-red-400 mb-2">
            {metrics.traffic?.bounceRate?.toFixed(1) || '0'}%
          </p>
          <p className="text-lg text-cyan-200">
            {ga4Connected ? 'From GA4' : 'Connect GA4 to see bounce insights'}
          </p>
        </div>
      </div>

      {/* Top Channel – compact */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-4xl text-cyan-300 mb-2">Top Channel</p>
        <p className="text-6xl md:text-7xl font-black text-cyan-400 mb-2">{metrics.acquisition.top_channel}</p>
        <p className="text-xl text-cyan-200 mb-2">
          Acquisition Cost: £{metrics.acquisition.acquisition_cost?.toFixed(2) || '0'}
        </p>
        <p className="text-lg text-purple-300">
          {ga4Connected 
            ? 'Top channel driving growth — allocate 60% budget here to lower CAC' 
            : 'Connect GA4 to unlock accurate channel & CAC data'}
        </p>
      </div>

      {/* Charts – original full size kept */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="metric-card p-8 rounded-2xl">
          <AcquisitionChart />
        </div>

        <div className="metric-card p-8 rounded-2xl">
          <CostTrendChart />
        </div>
      </div>
    </div>
  );
}