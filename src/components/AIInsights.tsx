'use client';

import useMetrics from "@/hooks/useMetrics";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
      console.error('Failed to load insights:', e);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      loadInsights();
    }
  }, [isLoading]);

  const openChat = (insight: string) => {
    router.push(`/ai?prompt=${encodeURIComponent(`Explain this insight and give me 3 actionable steps: ${insight}`)}`);
  };

  const openWinBack = () => {
    router.push('/churn');
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

        <div className="metric-card p-12 text-center rounded-3xl">
          {metrics && Object.keys(metrics).length > 0 ? (
            <>
              <p className="text-3xl text-cyan-300 mb-6 font-semibold">
                No actionable insights yet
              </p>
              <p className="text-xl text-cyan-200 mb-8">
                Your store metrics are loaded, but there's not enough activity (sales, orders, trends) for strong AI recommendations right now.
              </p>
              <p className="text-lg text-cyan-100 mb-10">
                Grok will start providing tailored growth advice as soon as meaningful data appears. Keep growing!
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl text-cyan-300 mb-6 font-semibold">
                Waiting for store metrics...
              </p>
              <p className="text-xl text-cyan-200 mb-8">
                We couldn't detect any metrics data yet. This is common right after connecting:
              </p>
              <ul className="text-left max-w-xl mx-auto text-cyan-100 text-lg mb-10 space-y-4 list-disc pl-8">
                <li>First data sync is still in progress (usually 5–30 minutes after install)</li>
                <li>No orders or sales recorded in the store yet</li>
                <li>Metrics collection job hasn't completed its first run</li>
              </ul>
              <p className="text-lg text-cyan-100 mb-10">
                Once data syncs, personalized insights will appear automatically.
              </p>
            </>
          )}

          <p className="text-xl text-cyan-200 mb-8">
            Here's what real insights look like once data flows in:
          </p>
          <div className="space-y-6 text-left max-w-2xl mx-auto mb-12">
            <p className="text-cyan-100">"Churn spiked 15% this week — send win-back emails to save £2,400/mo"</p>
            <p className="text-cyan-100">"AOV up to £68 — add bundles to push it higher"</p>
            <p className="text-cyan-100">"Repeat rate 42% — launch loyalty program for +20% revenue"</p>
          </div>

          <button 
            onClick={loadInsights} 
            className="cyber-btn text-xl px-10 py-4"
          >
            Refresh Insights
          </button>
        </div>
      </div>
    );
  }

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
          <div 
            key={i} 
            className="metric-card p-8 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-400/40 backdrop-blur-md shadow-2xl"
          >
            {i === 0 && insight.impact && (
              <div className="inline-block px-4 py-2 bg-red-500/80 rounded-full text-sm font-bold mb-4">
                TOP OPPORTUNITY — Potential £{insight.impact.toLocaleString()}/mo impact
              </div>
            )}

            <p className="text-xl md:text-2xl leading-relaxed text-cyan-100 mb-4">
              {insight.text}
            </p>

            {insight.historical && (
              <p className="text-cyan-300 text-lg mb-6">
                {insight.historical}
              </p>
            )}

            {insight.chartData && (
              <div className="h-32 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insight.chartData}>
                    <Line type="monotone" dataKey="value" stroke="#00ffff" strokeWidth={3} dot={false} />
                    <XAxis dataKey="name" stroke="#00ffff" />
                    <YAxis stroke="#00ffff" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0a0f2c', 
                        border: '1px solid #00ffff',
                        color: '#ffffff'
                      }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex gap-4 mt-6 flex-wrap">
              <button
                onClick={() => openChat(insight.text)}
                className="cyber-btn text-lg px-6 py-3"
              >
                Ask Grok for Action Plan →
              </button>

              {insight.text.toLowerCase().includes('churn') && (
                <button 
                  onClick={openWinBack} 
                  className="cyber-btn text-lg px-6 py-3 bg-red-500/80 hover:bg-red-500"
                >
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