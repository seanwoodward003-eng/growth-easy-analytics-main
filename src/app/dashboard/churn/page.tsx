'use client';

import useMetrics from "@/hooks/useMetrics";
import { ChurnChart } from "@/components/charts/ChurnChart";
import { AIInsights } from "@/components/AIInsights";

export default function ChurnPage() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) return <div className="text-center text-4xl mt-40 text-cyan-300 glow-medium">Loading data...</div>;
  if (isError) return <div className="text-center text-red-400 text-3xl mt-40">Check connections</div>;

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-7xl md:text-9xl font-black mb-16 text-red-400">
        CHURN RATE
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="metric-value text-8xl text-red-400">
          {metrics.churn?.rate || 3.2}%
        </p>
        <p className="text-5xl text-red-400 mt-8 glow-medium">
          {metrics.churn?.at_risk || 18} at risk
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <ChurnChart />
      </div>

      <AIInsights />
    </div>
  );
}