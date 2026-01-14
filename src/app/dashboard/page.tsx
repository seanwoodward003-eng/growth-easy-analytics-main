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

  // Debug logs - run on every render
  console.log('Dashboard render - shopifyConnected from hook:', shopifyConnected, 'isLoading:', isLoading);

  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [webhookRegistered, setWebhookRegistered] = useState(false);

  // NEW: Client-side user data fetch for debug + verification
  const [currentUser, setCurrentUser] = useState<{ id?: number; shopifyShop?: string | null; shopifyAccessToken?: string | null } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Assume you have or add a simple endpoint returning current user from requireAuth()
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          console.log('DASHBOARD DEBUG - Fetched user ID:', data.user?.id);
          console.log('DASHBOARD DEBUG - shopifyShop from DB:', data.user?.shopifyShop ?? 'NULL - not connected');
          console.log('DASHBOARD DEBUG - hasToken:', !!data.user?.shopifyAccessToken);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  const biggestOpportunity = metrics.churn?.rate > 7 
    ? `Reduce churn (${metrics.churn.rate}%) — fixing 2% = +£${Math.round(metrics.revenue.total * 0.02 / 12)}k MRR potential`
    : `Scale acquisition — your CAC is healthy`;

  const anyConnectionMissing = !shopifyConnected || !ga4Connected || !hubspotConnected;

  useEffect(() => {
    const justConnected = searchParams.get('shopify_connected') === 'true';
    console.log('useEffect - justConnected:', justConnected, 'shopifyConnected:', shopifyConnected);

    if (justConnected) {
      console.log('Strong refresh after Shopify connect');
      refresh();
      setTimeout(() => refresh(), 500);
      setTimeout(() => refresh(), 1500);
      window.history.replaceState({}, '', '/dashboard');
      alert('Shopify Connected Successfully!');
      // Force re-fetch user data after connect
      window.location.reload(); // Simple way to refresh debug
    }
  }, [searchParams, refresh, shopifyConnected]);

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
      console.log('Shopify webhook registration result:', data);
      
      alert('Shopify webhook registration result:\n' + JSON.stringify(data, null, 2));
      
      if (data?.success || data?.registered?.length > 0 || data?.message?.toLowerCase().includes('success')) {
        setWebhookRegistered(true);
      }
    } catch (err) {
      console.error('Failed to register Shopify webhook:', err);
      alert('Failed to register Shopify webhook:\n' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  // NEW: Reset button (DEV only)
  const handleResetShopify = async () => {
    if (!confirm('Reset Shopify connection? This clears tokens for your account only.')) return;
    
    try {
      const res = await fetch('/api/reset-shopify', { method: 'POST' });
      if (res.ok) {
        alert('Shopify connection reset! Refreshing...');
        window.location.reload();
      } else {
        alert('Reset failed');
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('Error resetting');
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 lg:px-24">
      <h1 className="text-center text-6xl md:text-8xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* NEW: Debug panel - visible for troubleshooting */}
      <div className="max-w-4xl mx-auto mb-8 p-6 bg-gray-900/50 rounded-xl border border-cyan-500/30">
        <h2 className="text-xl text-cyan-300 mb-4">Debug Info (remove later)</h2>
        {userLoading ? (
          <p>Loading user data...</p>
        ) : (
          <>
            <p>User ID: {currentUser?.id ?? 'Not loaded'}</p>
            <p>Shopify Shop: {currentUser?.shopifyShop ?? 'NULL - not connected'}</p>
            <p>Has Token: {currentUser?.shopifyAccessToken ? 'Yes' : 'No'}</p>
            <p>From hook - shopifyConnected: {shopifyConnected ? 'Yes' : 'No'}</p>
          </>
        )}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleResetShopify}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            [DEV] Reset Shopify Connection
          </button>
        )}
      </div>

      {/* Connect Banner */}
      {anyConnectionMissing && (
        <div 
          key={`banner-${shopifyConnected}-${ga4Connected}-${hubspotConnected}-${Date.now()}`}
          className="max-w-4xl mx-auto text-center mb-20 p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md"
        >
          <p className="text-3xl text-cyan-300 mb-6">
            Connect your accounts to unlock real-time data and AI-powered insights
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">

            {/* Shopify */}
            {!shopifyConnected && (
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
                    className="px-8 py-5 bg-white/10 backdrop-blur border border-cyan-500/50 rounded-xl text-white placeholder-cyan-300 text-xl focus:outline-none focus:border-cyan-300 w-full max-w-md"
                  />
                  <button
                    onClick={handleShopifyConnect}
                    disabled={isConnecting || !shopDomain}
                    className="cyber-btn text-2xl px-10 py-5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Shopify'}
                  </button>
                </div>
                {error && <p className="text-red-400 text-lg mt-3">{error}</p>}
                <p className="text-cyan-200 text-sm max-w-md mt-2">
                  Found in Settings → Domains in your Shopify admin
                </p>
              </div>
            )}

            {/* GA4 & HubSpot remain the same */}
            {!ga4Connected && (
              <button 
                onClick={() => window.location.href = '/api/auth/ga4'} 
                className="cyber-btn text-2xl px-10 py-5"
              >
                Connect GA4
              </button>
            )}

            {!hubspotConnected && (
              <button 
                onClick={() => window.location.href = '/api/auth/hubspot'} 
                className="cyber-btn text-2xl px-10 py-5"
              >
                Connect HubSpot
              </button>
            )}

            {/* Webhook button */}
            {shopifyConnected && !webhookRegistered && (
              <button
                onClick={handleRegisterWebhook}
                disabled={isRegisteringWebhook}
                className="cyber-btn text-2xl px-10 py-5 disabled:opacity-60"
              >
                {isRegisteringWebhook 
                  ? 'Registering Webhooks...' 
                  : 'Register Shopify Webhooks (one-time)'}
              </button>
            )}

            {shopifyConnected && webhookRegistered && (
              <div className="text-green-400 text-xl font-medium flex items-center gap-2">
                <span>✓ Shopify webhooks registered</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of your UI remains unchanged */}
      {/* Biggest Opportunity Card */}
      {!isLoading && (
        <div className="max-w-5xl mx-auto mb-16 p-10 rounded-3xl bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-4 border-purple-500/60 text-center">
          <p className="text-2xl text-purple-300 mb-4">Your Biggest Opportunity Right Now</p>
          <p className="text-4xl md:text-5xl font-bold text-white">{biggestOpportunity}</p>
        </div>
      )}

      {/* Metrics Grid - unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        {/* ... your metric cards ... */}
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