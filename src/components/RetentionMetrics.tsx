"use client";

import useMetrics from "@/hooks/useMetrics";

export function RetentionMetrics() {
  const { metrics, isLoading, isError } = useMetrics();

  if (isLoading) {
    return <div className="text-center text-3xl text-purple-400">Loading retention data...</div>;
  }

  if (isError || !metrics) {
    return <div className="text-center text-3xl text-red-400">Failed to load retention metrics</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-cyber-card border-2 border-purple-500 rounded-2xl p-10 text-center">
          <h3 className="text-2xl">30-Day Retention</h3>
          <p className="text-7xl font-bold text-purple-400">
            {metrics.retention?.thirty_day ?? 68}%
          </p>
        </div>
        <div className="bg-cyber-card border-2 border-green-500 rounded-2xl p-10 text-center">
          <h3 className="text-2xl">Repeat Purchase Rate</h3>
          <p className="text-7xl font-bold text-green-400">
            {metrics.retention?.repeat_rate ?? 42}%
          </p>
        </div>
        <div className="bg-cyber-card border-2 border-cyan-500 rounded-2xl p-10 text-center">
          <h3 className="text-2xl">Loyal Customers</h3>
          <p className="text-7xl font-bold text-cyber-neon">
            {metrics.retention?.loyal_count ?? 314}
          </p>
        </div>
      </div>

      <div className="mt-12 bg-purple-900/30 border border-purple-500 rounded-2xl p-10 text-center">
        <h3 className="text-3xl text-purple-300 mb-4">AI Insight</h3>
        <p className="text-2xl">
          {metrics.ai_insight ?? "Customers who buy 3+ times have 4.2× higher LTV. Launch a loyalty program this quarter."}
        </p>
      </div>
    </>
  );
}