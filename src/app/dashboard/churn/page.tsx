'use client';

import useMetrics from "@/hooks/useMetrics";
import { ChurnChart } from "@/components/charts/ChurnChart";
import { AIInsights } from "@/components/AIInsights";

export default function ChurnPage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-7xl md:text-9xl font-black mb-16 text-red-400">
        CHURN RATE
      </h1>

      {!isConnected && (
        <div className="text-center mb-12">
          <p className="text-3xl text-cyan-300 glow-medium mb-4">
            {isError ? "Unable to load real data — please connect your accounts" : "Demo mode active — connect accounts for real data"}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="metric-value text-8xl text-red-400">
          {metrics.churn.rate}%
        </p>
        <p className="text-5xl text-red-400 mt-8 glow-medium">
          {metrics.churn.at_risk} at risk
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <ChurnChart />
      </div>

      <AIInsights />
    </div>
  );
}