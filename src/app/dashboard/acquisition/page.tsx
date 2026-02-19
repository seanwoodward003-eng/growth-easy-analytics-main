'use client';

import useMetrics from "@/hooks/useMetrics";
import { AcquisitionChart } from "@/components/charts/AcquisitionChart";
import { CostTrendChart } from "@/components/charts/CostTrendChart";

export default function AcquisitionPage() {
  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    hasRealData 
  } = useMetrics();

  // ────────────────────────────────────────────────
  // DEBUG LOGS - remove after confirming fix
  // ────────────────────────────────────────────────
  console.log('[ACQUISITION PAGE DEBUG] useMetrics returned:', {
    metricsType: typeof metrics,
    metricsIsNull: metrics === null,
    metricsIsUndefined: metrics === undefined,
    isLoading,
    isError,
    shopifyConnected,
    ga4Connected,
    hasRealData
  });

  if (metrics) {
    console.log('[ACQUISITION PAGE DEBUG] metrics keys:', Object.keys(metrics));
    console.log('[ACQUISITION PAGE DEBUG] has acquisition?', 'acquisition' in metrics);
    console.log('[ACQUISITION PAGE DEBUG] has traffic?', 'traffic' in metrics);
  } else {
    console.warn('[ACQUISITION PAGE DEBUG] metrics is falsy - no data or error');
  }

  // ────────────────────────────────────────────────
  // SAFE GUARDS + EARLY RETURNS
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-cyan-300">
        Loading acquisition data...
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="px-4 py-10 text-center text-red-400">
        Unable to load acquisition data. Please check your Shopify/GA4 connections or try refreshing.
      </div>
    );
  }

  // Safe defaults
  const safeTraffic = metrics.traffic ?? { sessions: 0, bounceRate: 0 };
  const safeAcquisition = metrics.acquisition ?? { top_channel: '—', acquisition_cost: 0 };

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Acquisition heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-cyan-400">
        Acquisition
      </h1>

      {/* Traffic & Bounce Rate Cards – compact */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        <div className="metric-card p-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-3">Sessions (Last 30 Days)</h3>
          <p className="text-5xl md:text-6xl font-black text-cyan-400 mb-2">
            {safeTraffic.sessions.toLocaleString()}
          </p>
          <p className="text-lg text-cyan-200">
            {ga4Connected ? 'From GA4' : 'Connect GA4 to unlock real traffic data'}
          </p>
        </div>

        <div className="metric-card p-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-3">Bounce Rate</h3>
          <p className="text-5xl md:text-6xl font-black text-red-400 mb-2">
            {safeTraffic.bounceRate?.toFixed(1) || '0'}%
          </p>
          <p className="text-lg text-cyan-200">
            {ga4Connected ? 'From GA4' : 'Connect GA4 to see bounce insights'}
          </p>
        </div>
      </div>

      {/* Top Channel – compact */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-4xl text-cyan-300 mb-2">Top Channel</p>
        <p className="text-6xl md:text-7xl font-black text-cyan-400 mb-2">
          {safeAcquisition.top_channel}
        </p>
        <p className="text-xl text-cyan-200 mb-2">
          Acquisition Cost: £{safeAcquisition.acquisition_cost?.toFixed(2) || '0'}
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