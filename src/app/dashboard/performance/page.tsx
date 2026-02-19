'use client';

import useMetrics from "@/hooks/useMetrics";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { AIInsights } from "@/components/AIInsights";

export default function PerformancePage() {
  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    hasRealData 
  } = useMetrics();

  // ────────────────────────────────────────────────
  // DEBUG LOGS – remove after confirming the fix
  // ────────────────────────────────────────────────
  console.log('[PERFORMANCE PAGE DEBUG] === Render started ===');
  console.log('[PERFORMANCE PAGE DEBUG] useMetrics returned:', {
    metricsType: typeof metrics,
    metricsIsNull: metrics === null,
    metricsIsUndefined: metrics === undefined,
    isLoading,
    isError,
    shopifyConnected,
    hasRealData
  });

  if (metrics) {
    console.log('[PERFORMANCE PAGE DEBUG] metrics keys:', Object.keys(metrics));
    console.log('[PERFORMANCE PAGE DEBUG] has performance?', 'performance' in metrics);
    console.log('[PERFORMANCE PAGE DEBUG] has churn?', 'churn' in metrics);
    if ('performance' in metrics) {
      console.log('[PERFORMANCE PAGE DEBUG] performance keys:', Object.keys(metrics.performance || {}));
      console.log('[PERFORMANCE PAGE DEBUG] performance.ratio value:', metrics.performance?.ratio);
    }
  } else {
    console.warn('[PERFORMANCE PAGE DEBUG] metrics is falsy – likely auth/fetch error');
  }

  // ────────────────────────────────────────────────
  // SAFE GUARDS + EARLY RETURNS – prevent crash
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-cyan-300">
        Loading performance data...
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="px-4 py-10 text-center text-red-400">
        Unable to load performance data. Please check your Shopify connection or try refreshing.
      </div>
    );
  }

  // Safe defaults
  const safePerformance = metrics.performance ?? { ratio: 0 };
  const safeChurn = metrics.churn ?? { rate: 0 };
  const safeRepeatRate = metrics.repeatRate ?? 0;
  const safeRevenue = metrics.revenue ?? { total: 0 };

  // Safe health score & profit estimate
  const healthScore = Math.min(100, 
    (safePerformance.ratio * 20) + 
    (100 - safeChurn.rate * 2) + 
    safeRepeatRate
  );

  const profitEstimate = safeRevenue.total * 0.3;

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Performance heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-yellow-400">
        Performance
      </h1>

      {/* 3 Metric Cards – tight horizontal row, square-ish, rounded edges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* LTV:CAC Ratio */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">LTV:CAC Ratio</h3>
          <p className="text-3xl md:text-4xl font-black text-yellow-400">
            {safePerformance.ratio}:1
          </p>
          <p className="text-xs md:text-sm text-cyan-200">Ratio healthy — scale safely</p>
        </div>

        {/* Store Health Score */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Health Score</h3>
          <p className="text-4xl md:text-5xl font-black text-gradient bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {Math.round(healthScore)}
          </p>
          <p className="text-xs md:text-sm text-cyan-300 mt-1">/100</p>
        </div>

        {/* Estimated Monthly Profit */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Est. Monthly Profit</h3>
          <p className="text-3xl md:text-4xl font-black text-green-400">
            £{profitEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs md:text-sm text-cyan-200">30% margin estimate</p>
        </div>
      </div>

      {/* How You Compare – compact */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">How You Compare</h2>
        <div className="metric-card p-6 text-center">
          <p className="text-xl md:text-2xl text-cyan-300">
            Your LTV:CAC beats 75% of similar stores
          </p>
        </div>
      </div>

      {/* Split: Performance Chart (left 50%), AI Insights (right 50%) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="metric-card p-6 rounded-2xl">
          <PerformanceChart />
        </div>

        <div className="metric-card p-6 rounded-2xl">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}