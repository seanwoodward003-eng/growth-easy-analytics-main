'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { metrics, isLoading, refetch } = useMetrics(); // ← refetch must be exposed

  // Shopify connection input state
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const biggestOpportunity = metrics.churn?.rate > 7 
    ? `Reduce churn (${metrics.churn.rate}%) — fixing 2% = +£${Math.round(metrics.revenue.total * 0.02 / 12)}k MRR potential`
    : `Scale acquisition — your CAC is healthy`;

  const anyConnectionMissing = !metrics.shopify?.connected || !metrics.ga4?.connected || !metrics.hubspot?.connected;

  // Trigger refetch if we just came back from successful Shopify OAuth
  useEffect(() => {
    const justConnected = searchParams.get('shopify_connected') === 'true';
    if (justConnected && refetch) {
      refetch(); // Pull fresh data using the new access token

      // Clean the URL so the param doesn't linger
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, refetch]);

  const handleShopifyConnect = () => {
    if (!shopDomain) {
      setError('Please enter your Shopify store domain');
      return;
    }
    if (!shopDomain.endsWith('.myshopify.com')) {
      setError('Domain must end with .myshopify.com (e.g., my-store.myshopify.com)');
      return;
    }
    setError('');
    setIsConnecting(true);
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(shopDomain.trim().toLowerCase())}`;
  };

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 lg:px-24">
      <h1 className="text-center text-6xl md:text-8xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* Connect Accounts Banner */}
      {anyConnectionMissing && (
        <div className="max-w-4xl mx-auto text-center mb-20 p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md">
          <p className="text-3xl text-cyan-300 mb-6">
            Connect your accounts to unlock real-time data and AI-powered insights
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">

            {/* Shopify Connect */}
            {!metrics.shopify?.connected && (
              <div className="flex flex-col items-center gap-6">
                <p className="text-2xl text-cyan-200">Connect your Shopify store</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value.trim())}
                    onKeyDown={(e) => e.key === 'Enter' && handleShopifyConnect()}
                    disabled={isConnecting}
                    className="px-8 py-5 bg-white/10 backdrop-blur border border-cyan-500/50 rounded-xl text-white placeholder-cyan-300 text-xl focus:outline-none focus:border-cyan-300"
                  />
                  <button
                    onClick={handleShopifyConnect}
                    disabled={isConnecting || !shopDomain}
                    className="cyber-btn text-2xl px-10 py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Shopify'}
                  </button>
                </div>
                {error && <p className="text-red-400 text-lg">{error}</p>}
                <p className="text-cyan-200 text-sm max-w-md">
                  Enter your store’s myshopify.com domain (found in Settings → Domains in Shopify admin)
                </p>
              </div>
            )}

            {/* Other integrations */}
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

      {/* Biggest Opportunity */}
      <div className="max-w-5xl mx-auto mb-16 p-10 rounded-3xl bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-4 border-purple-500/60 text-center">
        <p className="text-2xl text-purple-300 mb-4">Your Biggest Opportunity Right Now</p>
        <p className="text-4xl md:text-5xl font-bold text-white">{biggestOpportunity}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Revenue</h3>
          <p className="text-7xl font-black text-cyan-400 mb-4">
            £{metrics.revenue?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-3xl text-green-400">{metrics.revenue?.trend || ''}</p>
          <p className="text-xl text-cyan-200 mt-6">Revenue growing — double down on top channel</p>
        </div>

        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Churn Rate</h3>
          <p className="text-7xl font-black text-red-400 mb-4">
            {metrics.churn?.rate ?? 0}%
          </p>
          <p className="text-3xl text-red-400">{metrics.churn?.at_risk ?? 0} at risk</p>
          <p className="text-xl text-cyan-200 mt-6">
            High churn — send win-back emails to at-risk customers
          </p>
        </div>

        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Average Order Value</h3>
          <p className="text-7xl font-black text-green-400 mb-4">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xl text-cyan-200 mt-6">Increase with bundles & upsells</p>
        </div>

        <div className="metric-card p-10 text-center">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">Repeat Purchase Rate</h3>
          <p className="text-7xl font-black text-green-400 mb-4">
            {metrics.repeatRate?.toFixed(1) || '0'}%
          </p>
          <p className="text-xl text-cyan-200 mt-6">Customers buying again</p>
        </div>

        <div className="metric-card p-10 text-center col-span-1 md:col-span-2 lg:col-span-4">
          <h3 className="text-4xl font-bold text-cyan-300 mb-6">LTV:CAC Ratio</h3>
          <p className="text-7xl font-black text-green-400 mb-8">
            {metrics.performance?.ratio || '0'}:1
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