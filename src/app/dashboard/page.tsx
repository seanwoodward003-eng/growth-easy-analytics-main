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

      {/* Waiting List Form – ADDED HERE (bottom of page) */}
      <div className="max-w-5xl mx-auto mt-12 p-8 bg-gray-900/80 border border-cyan-500/30 rounded-2xl backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
          Join the Waiting List
        </h2>
        <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
          Be the first to get full access to GrowthEasy AI + 3 months free when we launch publicly.
        </p>

        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;

            if (!name || !email) {
              alert('Name and email required');
              return;
            }

            try {
              const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
              });

              const data = await res.json();

              if (res.ok) {
                alert('Thanks! You\'re on the list.');
                form.reset();
              } else {
                alert(data.error || 'Something went wrong');
              }
            } catch (err) {
              alert('Network error');
            }
          }}
          className="max-w-md mx-auto space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Your name"
            required
            className="w-full p-4 bg-gray-800 border border-cyan-500/50 rounded-lg text-white placeholder-cyan-500 focus:outline-none focus:border-cyan-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            className="w-full p-4 bg-gray-800 border border-cyan-500/50 rounded-lg text-white placeholder-cyan-500 focus:outline-none focus:border-cyan-400"
          />
          <button 
            type="submit" 
            className="w-full p-4 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 transition"
          >
            Join Waiting List
          </button>
        </form>

        <p className="text-xs text-cyan-500/70 mt-6 text-center">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}