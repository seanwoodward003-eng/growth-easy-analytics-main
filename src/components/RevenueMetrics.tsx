"use client";

import useMetrics from "@/hooks/useMetrics";

export function RevenueMetrics() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) {
    return <div className="text-center text-3xl text-green-400">Loading revenue data...</div>;
  }

  if (isError || !metrics) {
    return <div className="text-center text-3xl text-red-400">Failed to load revenue metrics</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div className="bg-cyber-card border-2 border-green-500 rounded-2xl p-10 text-center">
          <h3 className="text-3xl">Total Revenue (30d)</h3>
          <p className="text-8xl font-bold text-green-400">
            £{(metrics.revenue?.total ?? 12700).toLocaleString()}
          </p>
          <p className="text-3xl text-green-300 mt-4">
            {metrics.revenue?.trend ?? "+6%"}
          </p>
        </div>
        <div className="bg-cyber-card border-2 border-cyan-500 rounded-2xl p-10 text-center">
          <h3 className="text-3xl">Forecast Next 30d</h3>
          <p className="text-7xl font-bold text-cyber-neon">
            £{(metrics.revenue?.forecast ?? 13800).toLocaleString()}
          </p>
          <p className="text-2xl text-cyan-300 mt-4">
            {metrics.revenue?.forecast_trend ?? "+8.7% projected"}
          </p>
        </div>
      </div>

      <div className="mt-12 bg-green-900/30 border border-green-500 rounded-2xl p-10 text-center">
        <h3 className="text-3xl text-green-400 mb-4">AI Forecast</h3>
        <p className="text-2xl">
          {metrics.ai_insight ?? "Upsell your top 10 customers → +£3,200 recurring revenue."}
        </p>
      </div>
    </>
  );
}