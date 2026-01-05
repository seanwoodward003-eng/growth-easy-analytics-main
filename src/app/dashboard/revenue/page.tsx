'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function RevenuePage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  // Simple forecast
  const forecast = metrics.revenue.total * 1.15;

  return (
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-green-400">
        Revenue
      </h1>

      {/* ... not connected state ... */}

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Total Revenue</p>
        <p className="metric-value text-8xl text-green-400 mb-4">£{metrics.revenue.total.toLocaleString()}</p>
      </div>

      {/* AOV */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">Average Order Value</h2>
        <div className="metric-card p-10 text-center">
          <p className="text-7xl font-black text-green-400 mb-4">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* LTV Breakdown */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">LTV Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">New Customers</h3>
            <p className="text-6xl font-black text-yellow-400">£{metrics.ltvNew?.toFixed(0) || '0'}</p>
          </div>
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Returning Customers</h3>
            <p className="text-6xl font-black text-green-400">£{metrics.ltvReturning?.toFixed(0) || '0'}</p>
          </div>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">12-Month Forecast</h2>
        <div className="metric-card p-10 text-center">
          <p className="text-7xl font-black text-green-400 mb-4">
            £{forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-2xl text-cyan-200">At 15% growth — reduce churn to hit higher</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <RevenueChart />
      </div>

      <AIInsights page="revenue" />
    </div>
  );
}