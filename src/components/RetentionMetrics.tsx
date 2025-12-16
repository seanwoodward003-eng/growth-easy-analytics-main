"use client";

import useMetrics from "@/hooks/useMetrics";

export function RevenueMetrics() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) {
    return <div className="text-center text-3xl text-cyan-400">Loading revenue data...</div>;
  }

  if (isError || !metrics) {
    return <div className="text-center text-3xl text-red-400">Failed to load revenue metrics</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-12">
        <div className="bg-cyber-card border-2 border-green-500 rounded-2xl p-10 text-center">
          <h3 className="text-3xl mb-4">Monthly Revenue</h3>
          <p className="text-8xl font-bold text-green-400">
            £{metrics.revenue?.total?.toLocaleString() ?? "125,400"}
          </p>
          <p className="text-2xl text-green-300 mt-4">
            {metrics.revenue?.trend ?? "+12% vs last month"}
          </p>
        </div>

        <div className="bg-cyber-card border-2 border-cyan-500 rounded-2xl p-10 text-center">
          <h3 className="text-3xl mb-4">Average Order Value</h3>
          <p className="text-8xl font-bold text-cyber-neon">
            £{metrics.revenue?.aov ?? 84}
          </p>
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-green-900/40 to-cyan-900/40 border border-cyber-neon rounded-2xl p-10 text-center">
        <h3 className="text-3xl text-cyber-neon mb-4">AI Insight</h3>
        <p className="text-2xl">
          {metrics.ai_insight ?? "Revenue trending up. Upsell bundles to high-AOV customers for +18% boost."}
        </p>
      </div>
    </>
  );
}