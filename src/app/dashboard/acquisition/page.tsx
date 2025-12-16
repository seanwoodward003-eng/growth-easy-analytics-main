'use client';

import useMetrics from "@/hooks/useMetrics";
import { AcquisitionChart } from "@/components/charts/AcquisitionChart";
import { CostTrendChart } from "@/components/charts/CostTrendChart";
import { AIInsights } from "@/components/AIInsights";

export default function AcquisitionPage() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) return <div className="text-center text-4xl mt-40 text-cyan-300 glow-medium">Loading data...</div>;
  if (isError) return <div className="text-center text-red-400 text-3xl mt-40">Check connections</div>;

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-cyan-400">
        Acquisition
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Top Channel</p>
        <p className="metric-value text-7xl">{metrics.acquisition?.top_channel || 'Organic'}</p>
        <p className="text-5xl text-cyan-300 mt-8">Acquisition Cost</p>
        <p className="metric-value text-7xl">£{metrics.acquisition?.cac || 87}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto mb-20">
        <AcquisitionChart />
        <CostTrendChart />
      </div>

      <AIInsights />
    </div>
  );
}