'use client';

import useMetrics from "@/hooks/useMetrics";
import { RetentionChart } from "@/components/charts/RetentionChart";
import { AIInsights } from "@/components/AIInsights";

export default function RetentionPage() {
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
  console.log('[RETENTION PAGE DEBUG] === Render started ===');
  console.log('[RETENTION PAGE DEBUG] useMetrics returned:', {
    metricsType: typeof metrics,
    metricsIsNull: metrics === null,
    metricsIsUndefined: metrics === undefined,
    isLoading,
    isError,
    shopifyConnected,
    hasRealData
  });

  if (metrics) {
    console.log('[RETENTION PAGE DEBUG] metrics keys:', Object.keys(metrics));
    console.log('[RETENTION PAGE DEBUG] has retention?', 'retention' in metrics);
    if ('retention' in metrics) {
      console.log('[RETENTION PAGE DEBUG] retention keys:', Object.keys(metrics.retention || {}));
      console.log('[RETENTION PAGE DEBUG] retention.rate value:', metrics.retention?.rate);
    } else {
      console.warn('[RETENTION PAGE DEBUG] retention key MISSING in metrics');
    }
  } else {
    console.warn('[RETENTION PAGE DEBUG] metrics is falsy – likely auth/fetch error');
  }

  // ────────────────────────────────────────────────
  // SAFE GUARDS + EARLY RETURNS – prevent crash
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-cyan-300">
        Loading retention data...
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="px-4 py-10 text-center text-red-400">
        Unable to load retention data. Please check your Shopify connection or try refreshing.
      </div>
    );
  }

  // Safe defaults
  const safeRetention = metrics.retention ?? { rate: 0 };

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Retention heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-purple-400">
        Retention
      </h1>

      {/* Retention Rate – compact */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-4xl text-cyan-300 mb-2">Retention Rate</p>
        <p className="text-6xl md:text-7xl font-black text-purple-400 mb-2">
          {safeRetention.rate}%
        </p>
        <p className="text-lg text-cyan-200">
          Retention strong — build loyalty programs to boost further
        </p>
      </div>

      {/* Cohort Table – compact */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">Cohort Retention</h2>
        <div className="metric-card p-6 md:p-8">
          <p className="text-xl text-cyan-200 text-center mb-4">
            Month-by-month retention by customer cohort (coming soon — based on first purchase date)
          </p>
          {/* Placeholder table */}
          <div className="mt-6 grid grid-cols-6 gap-3 text-center text-sm md:text-base">
            <div className="text-cyan-300">Cohort</div>
            <div className="text-cyan-300">Month 0</div>
            <div className="text-cyan-300">Month 1</div>
            <div className="text-cyan-300">Month 2</div>
            <div className="text-cyan-300">Month 3</div>
            <div className="text-cyan-300">Month 6</div>
            <div className="text-cyan-200">Jan 2026</div>
            <div className="text-green-400">100%</div>
            <div className="text-green-400">65%</div>
            <div className="text-yellow-400">48%</div>
            <div className="text-yellow-400">35%</div>
            <div className="text-red-400">22%</div>
          </div>
        </div>
      </div>

      {/* Split: Retention Chart (left 50%), AI Insights (right 50%) */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="metric-card p-6 md:p-8 rounded-2xl">
          <RetentionChart />
        </div>

        <div className="metric-card p-6 md:p-8 rounded-2xl">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}