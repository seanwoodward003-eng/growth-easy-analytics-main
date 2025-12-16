"use client";

import useMetrics from "@/hooks/useMetrics";
import { MetricCard } from "@/components/ui/MetricCard";

export function DashboardMetrics() {
  const { metrics, isLoading } = useMetrics();  // ← Changed 'data' to 'metrics'

  if (isLoading) {
    return <p className="text-3xl text-center">Loading real-time data...</p>;
  }

  // Add a safety check in case metrics is undefined (e.g., error state)
  if (!metrics) {
    return <p className="text-3xl text-center text-red-400">Failed to load metrics</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <MetricCard
        title="Revenue"
        value={`£${metrics.revenue.total.toLocaleString()}`}
        trend={metrics.revenue.trend}
      />
      <MetricCard
        title="Churn Rate"
        value={`${metrics.churn.rate}%`}
        trend={`${metrics.churn.at_risk} at risk`}
        color="red"
      />
      <MetricCard
        title="LTV:CAC"
        value={`${metrics.performance.ratio}:1`}
        trend="Healthy"
      />
    </div>
  );
}