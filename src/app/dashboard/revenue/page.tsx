'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";

export default function RevenuePage() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) return <div className="text-center text-4xl mt-40 text-cyan-300 glow-medium">Loading data...</div>;
  if (isError) return <div className="text-center text-red-400 text-3xl mt-40">Check connections</div>;

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-green-400">
        Revenue
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="metric-value text-8xl text-green-400">
          £{(metrics.revenue?.total || 12700).toLocaleString()}
        </p>
        <p className="text-5xl text-green-400 mt-8 glow-medium">
          {metrics.revenue?.trend || '+6% (demo)'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <RevenueChart />
      </div>
    </div>
  );
}