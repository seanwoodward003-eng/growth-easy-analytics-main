'use client';

import useMetrics from "@/hooks/useMetrics";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';  // mini charts

export function AIInsights() {
  const { metrics, isLoading } = useMetrics();
  const [insights, setInsights] = useState<Array<{ text: string; impact: number; historical: string | null; chartData?: any[] }>>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (e) {
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && metrics.revenue?.total > 0) {
      loadInsights();
    }
  }, [isLoading, metrics]);

  const openChat = (insight: string) => {
    router.push(`/ai?prompt=${encodeURIComponent(`Explain this insight and give me 3 actionable steps: ${insight}`)}`);
  };

  const openWinBack = () => {
    router.push('/churn');  // or direct to win-back generator
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto my-20 px-6">
        <h2 className="glow-title text-center text-5xl font-black mb-16 text-cyan-400">
          AI Growth Insights
        </h2>
        <p className="text-center text-cyan-400 animate-pulse">Generating personalized insights...</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="max-w-6xl mx-auto my-20 px-6">
        <h2 className="glow-title text-center text-5xl font-black mb-16 text-cyan-400">
          AI Growth Insights
        </h2>
        <div className="metric-card p-12 text-center">
          <p className="text-3xl text-cyan-300 mb-8">
            Connect Shopify to see your first personalized insights
          </p>
          <p className="text-xl text-cyan-200 mb-12">
            Example insights you'll get:
          </p>
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <p className="text-cyan-100">"Churn spiked 15% this week — send win-back emails to save £2,400/mo"</p>
            <p className="text-cyan-100">"AOV up to £68 — add bundles to push it higher"</p>
            <p className="text-cyan-100">"Repeat rate 42% — launch loyalty program for +20% revenue"</p>
          </div>
          <button onClick={() => window.location.href = '/api/auth/shopify'} className="cyber-btn text-2xl px-12 py-5 mt-12">
            Connect Shopify Now
          </button>
        </div>
      </div>
    );
  }

  // Sort by impact (assume insights include impact score from Grok)
  const sortedInsights = insights.sort((a, b) => (b.impact || 0) - (a.impact || 0));

  return (
    <div className="max-w-6xl mx-auto my-20 px-6">
      <div className="flex items-center justify-between mb-12">
        <h2 className="glow-title text-5xl font-black text-cyan-400">
          AI Growth Insights
        </h2>
        <button onClick={loadInsights} className="cyber-btn text-xl px-6 py-3">
          Refresh Insights
        </button>
      </div>

      <div className="space-y-12">
        {sortedInsights.map((insight, i) => (
          <div key={i} className="metric-card p-8 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-400/40 backdrop-blur-md shadow-2xl">
            {/* Priority Badge */}
            {i === 0 && (
              <div className="inline-block px-4 py-2 bg-red-500/80 rounded-full text-sm font-bold mb-4">
                TOP OPPORTUNITY — Potential £{insight.impact?.toLocaleString() || 'X,XXX'}/mo impact
              </div>
            )}

            {/* Insight Text + Historical */}
            <p className="text-xl md:text-2xl leading-relaxed text-cyan-100 mb-4">
              {insight.text}
            </p>
            {insight.historical && (
              <p className="text-cyan-300 text-lg mb-6">
                {insight.historical}
              </p>
            )}

            {/* Mini Chart for Anomaly */}
            {insight.chartData && (
              <div className="h-32 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insight.chartData}>
                    <Line type="monotone" dataKey="value" stroke="#00ffff" strokeWidth={3} dot={false} />
                    <Tooltip contentStyle={{ background: '#0a0f2c', border: '1px solid #00ffff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => openChat(insight.text)}
                className="cyber-btn text-lg px-6 py-3"
              >
                Ask Grok for Action Plan →
              </button>
              {insight.text.toLowerCase().includes('churn') && (
                <button onClick={openWinBack} className="cyber-btn text-lg px-6 py-3 bg-red-500/80 hover:bg-red-500">
                  Launch Win-Back Campaign
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}