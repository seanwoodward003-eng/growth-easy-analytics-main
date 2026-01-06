'use client';

import useMetrics from "@/hooks/useMetrics";
import { AcquisitionChart } from "@/components/charts/AcquisitionChart";
import { CostTrendChart } from "@/components/charts/CostTrendChart";


export default function AcquisitionPage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-cyan-400">
        Acquisition
      </h1>

      

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Top Channel</p>
        <p className="metric-value text-8xl text-cyan-400 mb-4">{metrics.acquisition.top_channel}</p>
        <p className="text-2xl text-cyan-200 mb-4">Acquisition Cost: £{metrics.acquisition.cac}</p>
        <p className="text-xl text-purple-300 mt-6">Top channel driving growth — allocate 60% budget here to lower CAC</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        <div className="metric-card p-8">
          <AcquisitionChart />
        </div>
        <div className="metric-card p-8">
          <CostTrendChart />
        </div>
      </div>

    </div>
  );
}