'use client';

import useMetrics from "@/hooks/useMetrics";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { AIInsights } from "@/components/AIInsights";

export default function PerformancePage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-yellow-400">
        Performance
      </h1>

      {!isConnected && (
        <div className="text-center mb-12">
          <p className="text-3xl text-cyan-300 glow-medium mb-4">
            {isError ? "Unable to load real data — please connect your accounts" : "Demo mode active — connect accounts for real data"}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-yellow-400 mb-4">LTV:CAC Ratio</p>
        <p className="metric-value text-8xl text-yellow-400">
          {metrics.performance.ratio}:1
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <PerformanceChart />
      </div>

      <AIInsights />
    </div>
  );
}