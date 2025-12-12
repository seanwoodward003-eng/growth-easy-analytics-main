import { MetricCard } from "@/components/ui/MetricCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import useMetrics from "@/hooks/useMetrics";

export default function Dashboard() {
  const { data, isLoading } = useMetrics();

  return (
    <>
      <h1 className="text-5xl font-bold text-cyber-neon mb-10">Dashboard</h1>

      {isLoading ? (
        <p className="text-3xl text-center">Loading real-time data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <MetricCard title="Revenue" value={`£${data.revenue.total.toLocaleString()}`} trend={data.revenue.trend} />
          <MetricCard title="Churn Rate" value={`${data.churn.rate}%`} trend={`${data.churn.at_risk} at risk`} color="red" />
          <MetricCard title="LTV:CAC" value={`${data.performance.ratio}:1`} trend="Healthy" />
        </div>
      )}

      <RevenueChart />
    </>
  );
}
