// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows, getRow } from '@/lib/db';
import { DateTime } from 'luxon';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const user = auth.user;
  const userId = user.id;

  // Check for existing cached metrics (last hour)
  const lastMetric = await getRow<{ date: string }>(
    'SELECT date FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const needsSync =
    !lastMetric || DateTime.fromISO(lastMetric.date) < DateTime.now().minus({ hours: 1 });

  // Fetch latest 4 metric rows for history/trends
  const rows = await getRows<{
    revenue: number;
    churn_rate: number;
    at_risk: number;
    ltv: number;
    cac: number;
    top_channel: string;
    acquisition_cost: number;
    retention_rate: number;
    date: string;
  }>(
    'SELECT revenue, churn_rate, at_risk, ltv, cac, top_channel, acquisition_cost, retention_rate, date FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 4',
    [userId]
  );

  // Determine connection status from user record
  const shopifyConnected = !!(user.shopify_shop && user.shopify_access_token);
  const ga4Connected = !!user.ga4_connected; // adjust field name if different
  const hubspotConnected = !!user.hubspot_connected; // adjust field name if different

  // If no real metrics yet — return demo/placeholder data
  if (rows.length === 0 || needsSync) {
    return NextResponse.json({
      revenue: { total: 12700, trend: "+12%", history: { labels: [], values: [] } },
      churn: { rate: 3.2, at_risk: 18 },
      performance: { ratio: "3.4", ltv: 162, cac: 47 },
      acquisition: { top_channel: "Organic Search", acquisition_cost: 87 },
      retention: { rate: 68 },
      ai_insight: "Connect accounts for real insights.",
      shopify: { connected: shopifyConnected },
      ga4: { connected: ga4Connected },
      hubspot: { connected: hubspotConnected },
    });
  }

  const latest = rows[0];
  const historyLabels = rows.slice().reverse().map(r => r.date.slice(0, 10));
  const historyValues = rows.slice().reverse().map(r => r.revenue);

  const trend =
    historyValues.length > 1 && historyValues[historyValues.length - 1] !== 0
      ? `${Math.sign(historyValues[0] - historyValues[historyValues.length - 1]) > 0 ? '+' : ''}${Math.round(
          ((historyValues[0] - historyValues[historyValues.length - 1]) /
            historyValues[historyValues.length - 1]) *
            100
        )}%`
      : '0%';

  const monthlyChurnImpact = Math.round(latest.revenue * (latest.churn_rate / 100));
  const insight = `Churn ${latest.churn_rate.toFixed(1)}% – Send win-backs to ${latest.at_risk} at-risk customers to save ~£${monthlyChurnImpact}/mo.`;

  return NextResponse.json({
    revenue: {
      total: latest.revenue,
      trend,
      history: { labels: historyLabels, values: historyValues },
    },
    churn: { rate: latest.churn_rate, at_risk: latest.at_risk },
    performance: {
      ratio: ((latest.ltv || 150) / (latest.cac || 50)).toFixed(1),
      ltv: latest.ltv || 150,
      cac: latest.cac || 50,
    },
    acquisition: {
      top_channel: latest.top_channel || 'Organic',
      acquisition_cost: latest.acquisition_cost || 0,
    },
    retention: { rate: latest.retention_rate || 85 },
    ai_insight: insight,
    // Connection status — used by frontend to hide/show connect buttons
    shopify: { connected: shopifyConnected },
    ga4: { connected: ga4Connected },
    hubspot: { connected: hubspotConnected },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });