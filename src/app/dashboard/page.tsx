'use client';

import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function Dashboard() {
  const { metrics, isLoading, isConnected } = useMetrics();

  const biggestOpportunity = metrics.churn.rate > 7 
    ? `Reduce churn (${metrics.churn.rate}%) — fixing 2% = +£${Math.round(metrics.revenue.total * 0.02 / 12)}k MRR potential`
    : `Scale acquisition — your CAC is healthy`;

  const anyConnectionMissing = !metrics.shopify?.connected || !metrics.ga4?.connected || !metrics.hubspot?.connected;

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 lg:px-24">
      <h1 className="text-center text-6xl md:text-8xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* Connect Buttons — only show if any integration missing */}
      {anyConnectionMissing && (
        <div className="max-w-4xl mx-auto text-center mb-20 p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md">
          <p className="text-3xl text-cyan-300 mb-6">
            Connect your accounts to unlock real-time data and AI-powered insights
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {!metrics.shopify?.connected && (
              <button onClick={() => window.location.href = '/api/auth/shopify'} className="cyber-btn text-2xl px-10 py-5">
                Connect Shopify
              </button>
            )}
            {!metrics.ga4?.connected && (
              <button onClick={() => window.location.href = '/api/auth/ga4'} className="cyber-btn text-2xl px-10 py-5">
                Connect GA4
              </button>
            )}
            {!metrics.hubspot?.connected && (
              <button onClick={() => window.location.href = '/api/auth/hubspot'} className="cyber-btn text-2xl px-10 py-5">
                Connect HubSpot
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto mb-16 p-10 rounded-3xl bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-4 border-purple-500/60 text-center">
        <p className="text-2xl text-purple-300 mb-4">Your Biggest Opportunity Right Now</p>
        <p className="text-4xl md:text-5xl font-bold text-white">{biggestOpportunity}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        {/* Revenue */}
        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Revenue</h3>
          <p className="text-7xl font-black text-cyan-400 mb-4">
            £{metrics.revenue.total.toLocaleString()}
          </p>
          <p className="text-3xl text-green-400">{metrics.revenue.trend}</p>
          <p className="text-xl text-cyan-200 mt-6">Revenue growing — double down on top channel</p>
        </div>

        {/* Churn */}
        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Churn Rate</h3>
          <p className="text-7xl font-black text-red-400 mb-4">
            {metrics.churn.rate}%
          </p>
          <p className="text-3xl text-red-400">{metrics.churn.at_risk} at risk</p>
          <p className="text-xl text-cyan-200 mt-6">
            High churn — send win-back emails to at-risk customers
          </p>
        </div>

        {/* AOV */}
        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Average Order Value</h3>
          <p className="text-7xl font-black text-green-400 mb-4">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xl text-cyan-200 mt-6">Increase with bundles & upsells</p>
        </div>

        {/* Repeat Purchase Rate */}
        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Repeat Purchase Rate</h3>
          <p className="text-7xl font-black text-green-400 mb-4">
            {metrics.repeatRate?.toFixed(1) || '0'}%
          </p>
          <p className="text-xl text-cyan-200 mt-6">Customers buying again</p>
        </div>

        {/* LTV:CAC */}
        <div className="metric-card p-10 text-center col-span-1 md:col-span-2 lg:col-span-4">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">LTV:CAC Ratio</h3>
          <p className="text-7xl font-black text-green-400 mb-8">
            {metrics.performance.ratio}:1
          </p>
          <p className="text-xl text-cyan-200">
            Ratio healthy — scale acquisition safely
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-20">
        <div className="metric-card p-8">
          <RevenueChart />
        </div>
      </div>

      <AIInsights />
    </div>
  );
}