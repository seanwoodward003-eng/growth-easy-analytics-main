'use client';

import useMetrics from "@/hooks/useMetrics";
import { RetentionChart } from "@/components/charts/RetentionChart";
import { AIInsights } from "@/components/AIInsights";

export default function RetentionPage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-purple-400">
        Retention
      </h1>

      {!isConnected && (
        <div className="text-center mb-12">
          <p className="text-3xl text-cyan-300 glow-medium mb-4">
            {isError ? "Unable to load real data — please connect your accounts" : "Demo mode active — connect accounts for real data"}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-purple-400 mb-4">Retention Rate</p>
        <p className="metric-value text-8xl text-purple-400">
          {metrics.retention.rate}%
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <RetentionChart />
      </div>

      <AIInsights />
    </div>
  );
}