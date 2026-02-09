'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useMetrics from "@/hooks/useMetrics";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AIInsights } from "@/components/AIInsights";
import Link from 'next/link';

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

  const biggestOpportunity = metrics.churn?.rate > 7 
    ? `Reduce churn (${metrics.churn.rate}%) — fixing 2% = +£${Math.round(metrics.revenue.total * 0.02 / 12)}k MRR potential`
    : `Scale acquisition — your CAC is healthy`;

  // Show connect message only if ANY connection is missing
  const showConnectMessage = !shopifyConnected || !ga4Connected || !hubspotConnected;

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

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Subheading – top-center, unchanged size */}
      <h1 className="text-center text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* Connect message – small text box at top, disappears when all connected */}
      {showConnectMessage && (
        <div className="max-w-3xl mx-auto mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/40 text-center">
          <p className="text-lg md:text-xl text-cyan-300">
            Connect Shopify, GA4, and HubSpot via the <Link href="/dashboard/settings" className="underline hover:text-cyan-100">Settings page</Link> to unlock full AI insights and real-time data.
          </p>
        </div>
      )}

      {/* 4 Metric Cards – tight row, square-ish, rounded edges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="metric-card p-4 md:p-6 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Revenue</h3>
          <p className="text-3xl md:text-4xl font-black text-cyan-400">
            £{metrics.revenue?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-xs md:text-sm text-green-400">{metrics.revenue?.trend || ''}</p>
        </div>

        <div className="metric-card p-4 md:p-6 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Churn Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-red-400">
            {metrics.churn?.rate ?? 0}%
          </p>
          <p className="text-xs md:text-sm text-red-400">{metrics.churn?.at_risk ?? 0} at risk</p>
        </div>

        <div className="metric-card p-4 md:p-6 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">AOV</h3>
          <p className="text-3xl md:text-4xl font-black text-green-400">
            £{metrics.aov?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="metric-card p-4 md:p-6 rounded-2xl text-center aspect-square flex flex-col justify-center">
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
 


        