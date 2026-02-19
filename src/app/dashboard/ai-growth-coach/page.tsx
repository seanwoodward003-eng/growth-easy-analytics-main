'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function RevenuePage() {
  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    hasRealData 
  } = useMetrics();

  // Guard: if no metrics yet or error, show fallback UI
  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-cyan-300">
        Loading revenue data...
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="px-4 py-10 text-center text-red-400">
        Unable to load revenue data. Please check your Shopify connection.
      </div>
    );
  }

  // Safe defaults if keys are missing
  const revenue = metrics.revenue ?? { total: 0, trend: '0%', history: { labels: [], values: [] } };
  const aov = metrics.aov ?? 0;
  const ltvNew = metrics.ltvNew ?? 0;
  const ltvReturning = metrics.ltvReturning ?? 0;

  // Safe forecast
  const forecast = (revenue.total || 0) * 1.15;

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-green-400">
        Revenue
      </h1>

      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-4xl text-cyan-300 mb-2">Total Revenue</p>
        <p className="text-6xl md:text-7xl font-black text-green-400 mb-2">
          £{revenue.total.toLocaleString()}
        </p>
        <p className="text-4xl md:text-5xl text-green-400 mb-2">{revenue.trend}</p>
        <p className="text-lg text-cyan-200">Revenue growing — focus on retention to sustain</p>
      </div>

      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">Average Order Value (AOV)</h2>
        <div className="metric-card p-6 md:p-8 text-center">
          <p className="text-5xl md:text-6xl font-black text-green-400 mb-2">
            £{aov.toFixed(2)}
          </p>
          <p className="text-lg text-cyan-200">Increase with bundles & upsells</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">LTV Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="metric-card p-6 md:p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">New Customers LTV</h3>
            <p className="text-5xl md:text-6xl font-black text-yellow-400">
              £{ltvNew.toFixed(0)}
            </p>
          </div>
          <div className="metric-card p-6 md:p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">Returning Customers LTV</h3>
            <p className="text-5xl md:text-6xl font-black text-green-400">
              £{ltvReturning.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">12-Month Revenue Forecast</h2>
        <div className="metric-card p-6 md:p-8 text-center">
          <p className="text-5xl md:text-6xl font-black text-green-400 mb-2">
            £{forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-lg text-cyan-200">At 15% growth — reduce churn to hit higher</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="metric-card p-4 md:p-6 rounded-2xl">
          <RevenueChart />
        </div>

        <div className="metric-card p-4 md:p-6 rounded-2xl">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}