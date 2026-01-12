// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';

export async function GET() {
  console.log('[METRICS-API] Invoked at', new Date().toISOString());

  const auth = await requireAuth();
  if ('error' in auth) {
    console.error('[METRICS-API] Auth failed:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const userId = auth.user.id;

  const shopifyConnected = !!(auth.user.shopify_shop && auth.user.shopify_access_token);
  const ga4Connected = !!auth.user.ga4_connected;
  const hubspotConnected = !!auth.user.hubspot_connected;

  // Fetch paid orders (increase limit as you grow)
  const orders = await getRows<{
    total_price: number | string;
    created_at: string;
    customer_id: string | number | null;
    source_name: string | null;
    financial_status: string;
  }>(
    `SELECT total_price, created_at, customer_id, source_name, financial_status
     FROM orders
     WHERE user_id = ?
     AND financial_status IN ('paid', 'partially_paid')
     ORDER BY created_at DESC LIMIT 5000`,
    [userId]
  );

  console.log('[METRICS-API] Paid orders count:', orders.length);

  if (orders.length === 0) {
    return NextResponse.json({
      revenue: { total: 0, average_order_value: 0, trend: '0%', history: { labels: [], values: [] } },
      churn: { rate: 0, at_risk: 0 },
      performance: { ratio: '0.0', ltv: 0, cac: 0 },
      acquisition: { top_channel: '—', acquisition_cost: 0 },
      retention: { rate: 0, repeat_purchase_rate: 0 },
      returning_customers_ltv: 0,
      ltv_breakdown: { one_time: 0, returning: 0 },
      cohort_retention: { data: [] },
      store_health_score: 0,
      ai_insight: shopifyConnected 
        ? 'Shopify connected, but no paid orders yet. Place a test order or check webhook sync.'
        : 'Connect Shopify to activate full analytics.',
      connections: { shopify: shopifyConnected, ga4: ga4Connected, hubspot: hubspotConnected },
    });
  }

  // ── Calculations ──

  // Revenue + AOV
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // History (daily – last 30 days)
  const dailyRevenue = new Map<string, number>();
  orders.forEach(o => {
    const date = o.created_at.split('T')[0];
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + Number(o.total_price || 0));
  });
  const sortedDays = Array.from(dailyRevenue.keys()).sort().reverse().slice(0, 30);
  const historyLabels = sortedDays.reverse();
  const historyValues = historyLabels.map(d => dailyRevenue.get(d) || 0);

  const trend = historyValues.length > 1 && historyValues[0] !== 0
    ? `${Math.sign(historyValues[historyValues.length - 1] - historyValues[0]) >= 0 ? '+' : ''}${Math.round(
        ((historyValues[historyValues.length - 1] - historyValues[0]) / historyValues[0]) * 100
      )}%`
    : '0%';

  // Customer analysis
  const customerMap = new Map<string | number, { orders: number; revenue: number; first: string; last: string }>();
  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const entry = customerMap.get(cid) || { orders: 0, revenue: 0, first: o.created_at, last: o.created_at };
      entry.orders += 1;
      entry.revenue += Number(o.total_price || 0);
      entry.last = o.created_at > entry.last ? o.created_at : entry.last;
      customerMap.set(cid, entry);
    }
  });

  const uniqueCustomers = customerMap.size;
  const returningCustomers = Array.from(customerMap.values()).filter(c => c.orders > 1).length;
  const repeatPurchaseRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;
  const retentionRate = repeatPurchaseRate; // same for now

  // LTV & breakdown
  const ltv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
  const returningLtv = returningCustomers > 0
    ? Array.from(customerMap.values())
        .filter(c => c.orders > 1)
        .reduce((s, c) => s + c.revenue, 0) / returningCustomers
    : 0;
  const oneTimeLtv = (totalRevenue - (returningLtv * returningCustomers)) / (uniqueCustomers - returningCustomers) || 0;

  // Churn
  const oneTimeBuyers = Array.from(customerMap.values()).filter(c => c.orders === 1).length;
  const churnRate = uniqueCustomers > 0 ? (oneTimeBuyers / uniqueCustomers) * 100 : 0;

  // Top channel
  const channelMap = new Map<string, number>();
  orders.forEach(o => {
    const ch = o.source_name || 'Unknown';
    channelMap.set(ch, (channelMap.get(ch) || 0) + 1);
  });
  let topChannel = '—';
  let max = 0;
  channelMap.forEach((c, ch) => { if (c > max) { max = c; topChannel = ch; } });

  // Cohort retention (monthly cohorts – basic)
  const cohortMap = new Map<string, { first: number; retained: Set<string | number> }>();
  const firstPurchase = new Map<string | number, string>();

  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const month = o.created_at.slice(0, 7); // YYYY-MM
      if (!firstPurchase.has(cid)) {
        firstPurchase.set(cid, month);
        cohortMap.set(month, { first: (cohortMap.get(month)?.first || 0) + 1, retained: new Set() });
      }
    }
  });

  // Mark retained
  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const first = firstPurchase.get(cid);
      const current = o.created_at.slice(0, 7);
      if (first && current > first) {
        const cohort = cohortMap.get(first);
        if (cohort) cohort.retained.add(cid);
      }
    }
  });

  const cohortRetention = Array.from(cohortMap.entries()).map(([month, { first, retained }]) => ({
    cohort: month,
    size: first,
    retained: retained.size,
    rate: first > 0 ? Number(((retained.size / first) * 100).toFixed(1)) : 0,
  }));

  // Store health score (0–100, example weights)
  const healthScore = Math.min(100,
    (totalRevenue > 0 ? 30 : 0) +
    (repeatPurchaseRate > 20 ? 20 : repeatPurchaseRate * 1) +
    (churnRate < 25 ? 20 : 0) +
    (ltv > 150 ? 15 : 0) +
    (topChannel !== '—' ? 15 : 0)
  );

  // AI insight – premium feel
  let insight = '';
  if (totalRevenue > 0) {
    insight = `£${totalRevenue.toFixed(0)} total revenue • ${trend} trend • AOV £${averageOrderValue.toFixed(0)}`;
    if (repeatPurchaseRate > 20) insight += ` • Strong repeat (${repeatPurchaseRate.toFixed(0)}%)`;
    if (churnRate > 20) insight += ` • Churn alert (${churnRate.toFixed(1)}%)`;
    insight += ` • Top channel: ${topChannel} • Health: ${healthScore}/100`;
  } else {
    insight = shopifyConnected
      ? 'Shopify connected – no paid orders yet. Test a sale or check sync.'
      : 'Connect Shopify to activate revenue, retention & full insights.';
  }

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      average_order_value: Number(averageOrderValue.toFixed(2)),
      trend,
      history: { labels: historyLabels, values: historyValues },
    },
    churn: {
      rate: Number(churnRate.toFixed(1)),
      at_risk: Math.round(uniqueCustomers * (churnRate / 100)),
    },
    performance: {
      ratio: (ltv / 100).toFixed(1),
      ltv: Number(ltv.toFixed(0)),
      cac: 0, // TODO: ad spend integration
    },
    acquisition: {
      top_channel: topChannel,
      acquisition_cost: 0,
    },
    retention: {
      rate: Number(retentionRate.toFixed(1)),
      repeat_purchase_rate: Number(repeatPurchaseRate.toFixed(1)),
    },
    returning_customers_ltv: Number(returningLtv.toFixed(0)),
    ltv_breakdown: {
      one_time: Number(oneTimeLtv.toFixed(0)),
      returning: Number(returningLtv.toFixed(0)),
    },
    ltv: {
      value: Number(ltv.toFixed(0)),
    },
    cohort_retention: {
      data: cohortRetention,
    },
    store_health_score: healthScore,
    ai_insight: insight,
    connections: {
      shopify: shopifyConnected,
      ga4: ga4Connected,
      hubspot: hubspotConnected,
    },
    debug: {
      ordersProcessed: orders.length,
      uniqueCustomers,
      returningCustomers,
      totalRevenue,
    },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });