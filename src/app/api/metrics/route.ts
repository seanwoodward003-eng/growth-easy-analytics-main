// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';

export async function GET() {
  console.log('[METRICS-API] Endpoint called at', new Date().toISOString());

  const auth = await requireAuth();
  if ('error' in auth) {
    console.log('[METRICS-API] Auth error:', auth.error, 'status:', auth.status);
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user;
  const userId = user.id;

  console.log('[METRICS-API] Auth successful - User ID:', userId);
  console.log('[METRICS-API]   shopify_shop value:', user.shopify_shop || '(null or undefined)');
  console.log('[METRICS-API]   shopify_access_token exists:', !!user.shopify_access_token ? 'YES (length ' + (user.shopify_access_token?.length || 0) + ')' : 'NO');

  // Determine connection status
  const shopifyConnected = !!(user.shopify_shop && user.shopify_access_token);
  const ga4Connected = !!user.ga4_connected;
  const hubspotConnected = !!user.hubspot_connected;

  console.log('[METRICS-API] Final connection flags:');
  console.log('[METRICS-API]   → shopifyConnected:', shopifyConnected);
  console.log('[METRICS-API]   → ga4Connected:', ga4Connected);
  console.log('[METRICS-API]   → hubspotConnected:', hubspotConnected);

  // Fetch real metrics from DB
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

  // If we have real metrics → use them
  if (rows.length > 0) {
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

    console.log('[METRICS-API] Returning real metrics + connection status');

    return NextResponse.json({
      revenue: {
        total: latest.revenue,
        trend,
        history: { labels: historyLabels, values: historyValues },
      },
      churn: { rate: latest.churn_rate, at_risk: latest.at_risk },
      performance: {
        ratio: ((latest.ltv || 0) / (latest.cac || 1) || 0).toFixed(1),
        ltv: latest.ltv || 0,
        cac: latest.cac || 0,
      },
      acquisition: {
        top_channel: latest.top_channel || '—',
        acquisition_cost: latest.acquisition_cost || 0,
      },
      retention: { rate: latest.retention_rate || 0 },
      ai_insight: insight,
      shopify: { connected: shopifyConnected },
      ga4: { connected: ga4Connected },
      hubspot: { connected: hubspotConnected },
    });
  }

  // No real metrics yet → show clean zeros (not fake demo data)
  console.log('[METRICS-API] No real metrics found → returning empty state with connection flags');

  return NextResponse.json({
    revenue: { total: 0, trend: '0%', history: { labels: [], values: [] } },
    churn: { rate: 0, at_risk: 0 },
    performance: { ratio: '0', ltv: 0, cac: 0 },
    acquisition: { top_channel: '—', acquisition_cost: 0 },
    retention: { rate: 0 },
    ai_insight: 'Connect your store to see real insights.',
    shopify: { connected: shopifyConnected },
    ga4: { connected: ga4Connected },
    hubspot: { connected: hubspotConnected },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });