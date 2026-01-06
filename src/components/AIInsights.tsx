'use client';

import useMetrics from "@/hooks/useMetrics";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AIInsights() {
  const { metrics, isLoading } = useMetrics();
  const [insights, setInsights] = useState<string[]>([]);
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
      setInsights(['Error loading insights — try again']);
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

  const displayedInsights = insights.length > 0 ? insights : [
    "Connect your accounts to unlock personalised AI insights.",
  ];

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

      <div className="space-y-10">
        {displayedInsights.map((insight, i) => (
          <button
            key={i}
            onClick={() => openChat(insight)}
            className="w-full text-left metric-card p-8 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-400/40 backdrop-blur-md shadow-2xl hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300"
          >
            <p className="text-xl md:text-2xl leading-relaxed text-cyan-100">
              {insight}
            </p>
            <p className="text-cyan-400 text-sm mt-4">Click for detailed action plan →</p>
          </button>
        ))}
      </div>
    </div>
  );
}