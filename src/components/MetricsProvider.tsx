"use client";

import useMetrics from "@/hooks/useMetrics";
import { MetricCard } from "@/components/ui/MetricCard";

interface MetricsProviderProps {
  children?: React.ReactNode;
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  const { metrics, isLoading, isError } = useMetrics();  // ← Fixed: metrics instead of data, and isError instead of error

  if (isLoading) {
    return <p className="text-center text-3xl text-cyber-neon">Loading real-time data...</p>;
  }

  if (isError) {
    return <p className="text-center text-3xl text-red-500">Error loading metrics</p>;
  }

  // Safety check (shouldn't happen due to above guards, but good practice)
  if (!metrics) {
    return <p className="text-center text-3xl text-red-500">No metrics available</p>;
  }

  return (
    <>
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

      {/* Render any child components (e.g., charts, detailed sections) */}
      {children}
    </>
  );
}