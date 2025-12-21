'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function Dashboard() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      {/* Banner */}
      {!isConnected && (
        <div className="text-center mb-12">
          <p className="text-3xl text-cyan-300 glow-medium mb-4">
            {isError ? "Unable to load real data — please connect your accounts" : "Demo mode active — connect accounts for real data"}
          </p>
        </div>
      )}

      <h2 className="glow-title text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
        Your Profile
      </h2>
      <p className="text-center text-3xl sm:text-4xl md:text-5xl mb-8 text-cyan-200">
        seanwoodward2023@gmail.com
      </p>
      <div className="text-center mb-16">
        <button className="cyber-btn text-2xl sm:text-3xl px-10 py-5">
          Logout
        </button>
      </div>

      <h2 className="glow-title text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
        Connect Your Accounts
      </h2>
      <p className="text-center text-xl sm:text-2xl md:text-3xl mb-10 text-gray-300">
        Shopify, GA4, HubSpot – real data powers AI insights.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <button className="cyber-btn text-xl sm:text-2xl px-8 py-4">Connect Shopify</button>
        <button className="cyber-btn text-xl sm:text-2xl px-8 py-4">Connect GA4</button>
        <button className="cyber-btn text-xl sm:text-2xl px-8 py-4">Connect HubSpot</button>
      </div>

      <p className="text-center text-cyan-400 text-lg sm:text-xl md:text-2xl mb-16 glow-medium">
        Checking connections...
      </p>

      <div className="max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="metric-bubble">
            <h3 className="text-4xl sm:text-5xl font-bold text-cyan-300 mb-4">Revenue</h3>
            <p className="metric-value">
              £{metrics.revenue.total.toLocaleString()}
            </p>
            <p className="text-3xl sm:text-4xl text-green-400 mt-6 glow-medium">
              {metrics.revenue.trend}
            </p>
          </div>

          <div className="metric-bubble">
            <h3 className="text-4xl sm:text-5xl font-bold text-cyan-300 mb-4">Churn Rate</h3>
            <p className="metric-value text-red-400">
              {metrics.churn.rate}%
            </p>
            <p className="text-3xl sm:text-4xl text-red-400 mt-6 glow-medium">
              {metrics.churn.at_risk} at risk
            </p>
          </div>

          <div className="metric-bubble">
            <h3 className="text-4xl sm:text-5xl font-bold text-cyan-300 mb-4">LTV:CAC</h3>
            <p className="metric-value text-green-400">
              {metrics.performance.ratio}:1
            </p>
            <p className="text-3xl sm:text-4xl text-green-400 mt-6 glow-medium">
              Healthy
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <h3 className="glow-title text-center text-5xl sm:text-6xl md:text-7xl mb-10">
          Revenue Trend
        </h3>
        <div className="chart-container bg-cyber-card/30 backdrop-blur-md border-4 border-cyber-neon rounded-3xl p-6 shadow-2xl">
          <RevenueChart />
        </div>
      </div>

      <AIInsights />
    </div>
  );
}