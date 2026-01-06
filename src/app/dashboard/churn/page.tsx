'use client';

import useMetrics from "@/hooks/useMetrics";
import { ChurnChart } from "@/components/charts/ChurnChart";
import { useState } from 'react';
import { AIInsights } from "@/components/AIInsights";

export default function ChurnPage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();
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
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-7xl md:text-9xl font-black mb-16 text-red-400">
        Churn Rate
      </h1>

     

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Churn Rate</p>
        <p className="metric-value text-8xl text-red-400 mb-4">{metrics.churn.rate}%</p>
        <p className="text-5xl text-red-400 mb-4">{metrics.churn.at_risk} at risk</p>
        <p className="text-xl text-cyan-200">High churn — send win-back emails to recover revenue</p>
      </div>

      {/* Repeat Purchase Rate */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Repeat Purchase Rate</p>
        <p className="metric-value text-8xl text-green-400 mb-4">
          {metrics.repeatRate?.toFixed(1) || '0'}%
        </p>
        <p className="text-xl text-cyan-200">Higher repeat rate = lower churn</p>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <ChurnChart />
      </div>

      {/* Win-Back Email Generator */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-cyan-400 mb-8">
            Fix Churn with AI
          </h2>
          <button
            onClick={generateWinBackEmail}
            disabled={loadingEmail}
            className="cyber-btn text-3xl px-12 py-6 animate-pulse"
          >
            {loadingEmail ? 'Generating Email...' : 'Generate Win-Back Email for At-Risk Customers'}
          </button>
        </div>

        {emailTemplate && (
          <div className="bg-black/60 border-4 border-cyan-400 rounded-3xl p-10 shadow-2xl">
            <h3 className="text-4xl font-bold text-cyan-300 text-center mb-8">
              Your Personalized Win-Back Email
            </h3>
            <div className="bg-gray-900/80 p-8 rounded-2xl text-left text-cyan-100 text-lg leading-relaxed whitespace-pre-wrap">
              {emailTemplate}
            </div>
            <p className="text-center text-cyan-400 mt-8 text-xl">
              Copy this into Klaviyo or HubSpot and send to recover revenue!
            </p>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <AIInsights />
    </div>
  );
}