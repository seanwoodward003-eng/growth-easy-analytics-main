'use client';

import useMetrics from "@/hooks/useMetrics";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

export default function PerformancePage() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) return <div className="text-center text-4xl mt-40 text-cyan-300 glow-medium">Loading data...</div>;
  if (isError) return <div className="text-center text-red-400 text-3xl mt-40">Check connections</div>;

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-yellow-400">
        Performance
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-yellow-400 mb-4">LTV:CAC Ratio</p>
        <p className="metric-value text-8xl text-yellow-400">
          {metrics.performance?.ratio || '3.4'}:1
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <PerformanceChart />
      </div>
    </div>
  );
}