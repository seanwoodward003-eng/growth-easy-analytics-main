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

  // Simple forecast
  const forecast = metrics.revenue.total * 1.15;

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Revenue heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-5xl font-black mb-6 text-green-400">
        Revenue
      </h1>

      {/* Total Revenue – compact */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-4xl text-cyan-300 mb-2">Total Revenue</p>
        <p className="text-6xl md:text-7xl font-black text-green-400 mb-2">
          £{metrics.revenue.total.toLocaleString()}
        </p>
        <p className="text-4xl md:text-5xl text-green-400 mb-2">{metrics.revenue.trend}</p>
        <p className="text-lg text-cyan-200">Revenue growing — focus on retention to sustain</p>
      </div>

      {/* AOV – compact */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">Average Order Value (AOV)</h2>
        <div className="metric-card p-6 md:p-8 text-center">
          <p className="text-5xl md:text-6xl font-black text-green-400 mb-2">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
          <p className="text-lg text-cyan-200">Increase with bundles & upsells</p>
        </div>
      </div>

      {/* LTV Breakdown – compact */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">LTV Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="metric-card p-6 md:p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">New Customers LTV</h3>
            <p className="text-5xl md:text-6xl font-black text-yellow-400">
              £{metrics.ltvNew?.toFixed(0) || '0'}
            </p>
          </div>
          <div className="metric-card p-6 md:p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">Returning Customers LTV</h3>
            <p className="text-5xl md:text-6xl font-black text-green-400">
              £{metrics.ltvReturning?.toFixed(0) || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Forecast – compact */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-4xl font-black text-cyan-400 text-center mb-4">12-Month Revenue Forecast</h2>
        <div className="metric-card p-6 md:p-8 text-center">
          <p className="text-5xl md:text-6xl font-black text-green-400 mb-2">
            £{forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-lg text-cyan-200">At 15% growth — reduce churn to hit higher</p>
        </div>
      </div>

      {/* Split: Revenue Chart (left 50%), AI Insights (right 50%) */}
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