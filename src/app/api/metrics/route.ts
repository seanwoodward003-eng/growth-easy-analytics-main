// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows, getRow } from '@/lib/db';
import { DateTime } from 'luxon';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.id;

  const lastMetric = await getRow<{ date: string }>(
    'SELECT date FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const needsSync =
    !lastMetric || DateTime.fromISO(lastMetric.date) < DateTime.now().minus({ hours: 1 });

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

  if (rows.length === 0) {
    return NextResponse.json({
      revenue: { total: 0, trend: '0%', history: { labels: [], values: [] } },
      churn: { rate: 0, at_risk: 0 },
      performance: { ratio: '0', ltv: 150, cac: 50 },
      acquisition: { top_channel: '', acquisition_cost: 0 },
      retention: { rate: 0 },
      ai_insight: 'Connect integrations to unlock real insights.',
    });
  }

  const latest = rows[0];
  const historyLabels = rows.slice().reverse().map(r => r.date.slice(0, 10));
  const historyValues = rows.slice().reverse().map(r => r.revenue);

  const trend =
    historyValues.length > 1 && historyValues[historyValues.length - 1] !== 0
      ? `${Math.round(
          ((historyValues[0] - historyValues[historyValues.length - 1]) /
            historyValues[historyValues.length - 1]) *
            100
        )}%`
      : '0%';

  const insight = `Churn ${latest.churn_rate.toFixed(1)}% – Send win-backs to ${latest.at_risk} at-risk to save £${Math.round(
    latest.revenue * (latest.churn_rate / 100)
  )}/mo.`;

  return NextResponse.json({
    revenue: { total: latest.revenue, trend, history: { labels: historyLabels, values: historyValues } },
    churn: { rate: latest.churn_rate, at_risk: latest.at_risk },
    performance: {
      ratio: ((latest.ltv || 150) / (latest.cac || 50)).toFixed(1),
      ltv: latest.ltv || 150,
      cac: latest.cac || 50,
    },
    acquisition: { top_channel: latest.top_channel || 'Organic', acquisition_cost: latest.acquisition_cost },
    retention: { rate: latest.retention_rate || 85 },
    ai_insight: insight,
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });