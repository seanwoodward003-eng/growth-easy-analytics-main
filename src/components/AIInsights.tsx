'use client';

import useMetrics from "@/hooks/useMetrics";

export function AIInsights() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) return null;

  const insights = [];

  // Revenue insights
  if (metrics.revenue?.trend?.includes('+')) {
    insights.push(`Revenue is up ${metrics.revenue.trend} — keep doing what you're doing! Consider scaling ad spend on your top channel.`);
  } else if (metrics.revenue?.trend?.includes('-')) {
    insights.push(`Revenue dipped ${metrics.revenue.trend.replace('+', '')} — check for seasonal trends or cart abandonment issues.`);
  }

  // Churn insights
  if (metrics.churn?.rate > 5) {
    insights.push(`Churn is high at ${metrics.churn.rate}% with ${metrics.churn.at_risk} at-risk customers. Send win-back emails with a 15-20% discount to save ~£${Math.round((metrics.revenue.total || 12700) * (metrics.churn.rate / 100) * 0.8)}/mo.`);
  } else if (metrics.churn?.rate > 3) {
    insights.push(`Churn at ${metrics.churn.rate}% — monitor closely. Customers with no purchase in 45+ days are most at risk.`);
  }

  // Acquisition insights
  if (metrics.acquisition?.top_channel) {
    insights.push(`Your top acquisition channel is ${metrics.acquisition.top_channel} — it's driving the majority of new customers. Double down here for fastest growth.`);
  }
  if (metrics.acquisition?.cac > 80) {
    insights.push(`Acquisition cost is £${metrics.acquisition.cac} — high. Test organic content or referral programs to lower it.`);
  }

  // Retention insights
  if (metrics.retention?.rate < 70) {
    insights.push(`Retention is ${metrics.retention.rate}% — launch a loyalty program or post-purchase email sequence to boost repeat purchases.`);
  }

  // Performance insights
  if (metrics.performance?.ratio > 3) {
    insights.push(`LTV:CAC ratio of ${metrics.performance.ratio}:1 is healthy — profitable customer acquisition. Scale confidently.`);
  } else if (metrics.performance?.ratio < 2.5) {
    insights.push(`LTV:CAC ratio of ${metrics.performance.ratio}:1 — improve by increasing AOV or reducing churn.`);
  }

  // Limit to 4 insights
  const displayedInsights = insights.slice(0, 4);

  if (displayedInsights.length === 0) {
    displayedInsights.push("Connect your accounts to unlock personalised AI insights.");
  }

  return (
    <div className="max-w-5xl mx-auto my-20">
      <h2 className="glow-title text-center text-5xl md:text-6xl font-black mb-12">
        AI Growth Insights
      </h2>
      <div className="space-y-8">
        {displayedInsights.map((insight, i) => (
          <div key={i} className="metric-bubble bg-cyber-card/40 border-cyan-400">
            <p className="text-xl md:text-2xl leading-relaxed text-cyan-100">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}