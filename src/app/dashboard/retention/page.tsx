'use client';

import useMetrics from "@/hooks/useMetrics";
import { RetentionChart } from "@/components/charts/RetentionChart";

export default function RetentionPage() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) return <div className="text-center text-4xl mt-40 text-cyan-300 glow-medium">Loading data...</div>;
  if (isError) return <div className="text-center text-red-400 text-3xl mt-40">Check connections</div>;

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-purple-400">
        Retention
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-purple-400 mb-4">Retention Rate</p>
        <p className="metric-value text-8xl text-purple-400">
          {metrics.retention?.rate || 68}%
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <RetentionChart />
      </div>
    </div>
  );
}