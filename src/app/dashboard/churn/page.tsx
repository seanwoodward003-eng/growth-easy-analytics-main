'use client';

import useMetrics from "@/hooks/useMetrics";
import { ChurnChart } from "@/components/charts/ChurnChart";
import { useState } from 'react';
import { AIInsights } from "@/components/AIInsights";

export default function ChurnPage() {
  const { 
    metrics, 
    isLoading, 
    isError, 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    hasRealData 
  } = useMetrics();
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const generateWinBackEmail = async () => {
    setLoadingEmail(true);
    try {
      const res = await fetch('/api/generate-winback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setEmailTemplate(data.template);
      } else {
        alert('Failed to generate email: ' + data.error);
      }
    } catch (e) {
      alert('Connection error — try again');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12 bg-gradient-to-br from-[#0a0f1c] to-[#0f1a2e]">
      {/* Churn Rate heading – 50% smaller */}
      <h1 className="glow-title text-center text-4xl md:text-6xl font-black mb-6 text-red-400">
        Churn Rate
      </h1>

      {/* 4 Metric Cards – tight horizontal row, same size as Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Churn Rate */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Churn Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-red-400">
            {metrics.churn?.rate ?? 0}%
          </p>
          <p className="text-xs md:text-sm text-red-400">{metrics.churn?.at_risk ?? 0} at risk</p>
        </div>

        {/* Email Open Rate */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Email Open Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-purple-400">
            {metrics.email?.openRate?.toFixed(1) || 'N/A'}%
          </p>
          <p className="text-xs md:text-sm text-cyan-200">
            {hubspotConnected ? 'Last 30 days' : 'Connect HubSpot'}
          </p>
        </div>

        {/* Click Rate */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Click Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-purple-400">
            {metrics.email?.clickRate?.toFixed(1) || 'N/A'}%
          </p>
          <p className="text-xs md:text-sm text-cyan-200">
            {hubspotConnected ? 'Last 30 days' : 'Connect HubSpot'}
          </p>
        </div>

        {/* Repeat Purchase Rate */}
        <div className="metric-card p-4 rounded-2xl text-center aspect-square flex flex-col justify-center">
          <h3 className="text-base md:text-lg font-bold text-cyan-300 mb-1">Repeat Rate</h3>
          <p className="text-3xl md:text-4xl font-black text-green-400">
            {metrics.repeatRate?.toFixed(1) || '0'}%
          </p>
          <p className="text-xs md:text-sm text-cyan-200">Higher = lower churn</p>
        </div>
      </div>

      {/* Split: Churn Chart (left 50%), AI Insights (right 50%) – reduced size */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="metric-card p-3 md:p-4 rounded-2xl h-48 md:h-64 lg:h-80 overflow-hidden">
          <ChurnChart />
        </div>

        <div className="metric-card p-3 md:p-4 rounded-2xl h-48 md:h-64 lg:h-80 overflow-hidden">
          <AIInsights />
        </div>
      </div>

      {/* Win-Back Email Generator – centered button */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-black text-cyan-400">
            Fix Churn with AI
          </h2>
        </div>
        <button
          onClick={generateWinBackEmail}
          disabled={loadingEmail}
          className="cyber-btn text-2xl md:text-3xl px-8 md:px-12 py-4 md:py-6 animate-pulse mx-auto block w-full md:w-auto"
        >
          {loadingEmail ? 'Generating Email...' : 'Generate Win-Back Email for At-Risk Customers'}
        </button>

        {emailTemplate && (
          <div className="mt-6 bg-black/60 border-4 border-cyan-400 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 text-center mb-4">
              Your Personalized Win-Back Email
            </h3>
            <div className="bg-gray-900/80 p-5 md:p-6 rounded-2xl text-left text-cyan-100 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {emailTemplate}
            </div>
            <p className="text-center text-cyan-400 mt-4 text-base md:text-xl">
              Copy this into Klaviyo or HubSpot and send to recover revenue!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}