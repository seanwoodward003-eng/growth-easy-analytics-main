'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    refresh 
  } = useMetrics();

  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [webhookRegistered, setWebhookRegistered] = useState(false);

  const biggestOpportunity = metrics.churn?.rate > 7 
    ? `Reduce churn (${metrics.churn.rate}%) — fixing 2% = +£${Math.round(metrics.revenue.total * 0.02 / 12)}k MRR potential`
    : `Scale acquisition — your CAC is healthy`;

  const anyConnectionMissing = !shopifyConnected || !ga4Connected || !hubspotConnected;

  useEffect(() => {
    const justConnected = searchParams.get('shopify_connected') === 'true';

    if (justConnected) {
      refresh();
      setTimeout(() => refresh(), 500);
      setTimeout(() => refresh(), 1500);
      window.history.replaceState({}, '', '/dashboard');
      alert('Shopify Connected Successfully!');
    }
  }, [searchParams, refresh]);

  const handleShopifyConnect = () => {
    if (!shopDomain.endsWith('.myshopify.com')) {
      setError('Please enter a valid .myshopify.com domain');
      return;
    }
    setError('');
    setIsConnecting(true);
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(shopDomain.trim().toLowerCase())}`;
  };

  const handleRegisterWebhook = async () => {
    setIsRegisteringWebhook(true);
    try {
      const res = await fetch('/api/register-webhook', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      alert('Shopify webhook registration result:\n' + JSON.stringify(data, null, 2));
      
      if (data?.success || data?.registered?.length > 0 || data?.message?.toLowerCase().includes('success')) {
        setWebhookRegistered(true);
      }
    } catch (err) {
      alert('Failed to register Shopify webhook:\n' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Header area – Dashboard title + stacked connect buttons top-right */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Dashboard
        </h1>

        {/* Stacked connect buttons – same size, top-right */}
        <div className="flex flex-col gap-3 w-full md:w-auto md:max-w-xs">
          {!shopifyConnected && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value.trim())}
                onKeyDown={(e) => e.key === 'Enter' && handleShopifyConnect()}
                disabled={isConnecting}
                className="px-4 py-2 bg-white/10 backdrop-blur border border-cyan-500/50 rounded-xl text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-300 w-full"
              />
              <button
                onClick={handleShopifyConnect}
                disabled={isConnecting || !shopDomain}
                className="cyber-btn text-sm px-6 py-2 w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect Shopify'}
              </button>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
          )}

          {!ga4Connected && (
            <button 
              onClick={() => window.location.href = '/api/auth/ga4'} 
              className="cyber-btn text-sm px-6 py-2 w-full"
            >
              Connect GA4
            </button>
          )}

          {!hubspotConnected && (
            <button 
              onClick={() => window.location.href = '/api/auth/hubspot'} 
              className="cyber-btn text-sm px-6 py-2 w-full"
            >
              Connect HubSpot
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards – tight horizontal row, square-ish, rounded */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Revenue</h3>
          <p className="text-3xl md:text-4xl font-black text-cyan-400">
            £{metrics.revenue?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-xs md:text-sm text-green-400">{metrics.revenue?.trend || ''}</p>
        </div>

        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Churn Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-red-400">
            {metrics.churn?.rate ?? 0}%
          </p>
          <p className="text-xs md:text-sm text-red-400">{metrics.churn?.at_risk ?? 0} at risk</p>
        </div>

        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">AOV</h3>
          <p className="text-3xl md:text-4xl font-black text-green-400">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Repeat Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-green-400">
            {metrics.repeatRate?.toFixed(1) || '0'}%
          </p>
        </div>
      </div>

      {/* Split: Left Revenue Chart (50%), Right AI Insights (50%) */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="metric-card p-4 md:p-6 rounded-2xl">
          <RevenueChart />
        </div>

        <div className="metric-card p-4 md:p-6 rounded-2xl">
          <AIInsights />
        </div>
      </div>

      {/* Biggest Opportunity – bottom, full width */}
      {!isLoading && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30 text-center">
          <p className="text-xl text-purple-300 mb-2">Biggest Opportunity Right Now</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{biggestOpportunity}</p>
        </div>
      )}
    </div>
  );
}