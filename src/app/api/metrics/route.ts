// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';

export async function GET() {
  console.log('[METRICS-API] Endpoint invoked at', new Date().toISOString());

  const auth = await requireAuth();
  if ('error' in auth) {
    console.error('[METRICS-API] Authentication failed:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const userId = auth.user.id;

  console.log('[METRICS-API] User authenticated → ID:', userId);
  console.log('[METRICS-API] Shopify shop:', auth.user.shopify_shop || '(not connected)');
  console.log('[METRICS-API] Shopify token:', auth.user.shopify_access_token ? 'present' : 'missing');

  const shopifyConnected = !!(auth.user.shopify_shop && auth.user.shopify_access_token);
  const ga4Connected = !!auth.user.ga4_connected;
  const hubspotConnected = !!auth.user.hubspot_connected;

  // ────────────────────────────────────────────────────────────────
  // Fetch all relevant paid orders (increase limit as your store grows)
  // ────────────────────────────────────────────────────────────────
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

  console.log('[METRICS-API] Paid orders retrieved:', orders.length);

  // ────────────────────────────────────────────────────────────────
  // Early return if no data — informative, not just zeros
  // ────────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    console.log('[METRICS-API] No paid orders found – returning diagnostic empty state');
    return NextResponse.json({
      revenue: {
        total: 0,
        average_order_value: 0,
        trend: '0%',
        history: { labels: [], values: [] },
      },
      churn: { rate: 0, at_risk: 0 },
      performance: { ratio: '0.0', ltv: 0, cac: 0 },
      acquisition: { top_channel: '—', acquisition_cost: 0 },
      retention: { rate: 0, repeat_purchase_rate: 0 },
      returning_customers_ltv: 0,
      ltv_breakdown: { one_time: 0, repeat: 0 },
      cohort_retention: { data: [] },
      store_health_score: 0,
      ai_insight: shopifyConnected
        ? 'Shopify is connected but no paid orders detected yet. Verify webhook/sync or place a test order.'
        : 'Connect Shopify to unlock revenue, retention, and full analytics.',
      connections: {
        shopify: shopifyConnected,
        ga4: ga4Connected,
        hubspot: hubspotConnected,
      },
      debug: { ordersFound: 0, message: 'Waiting for first paid order' },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Core computations – everything you asked for
  // ────────────────────────────────────────────────────────────────

  // 1. Revenue & AOV
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  // 2. Daily revenue history (for charts – last 30 days)
  const dailyRevenue = new Map<string, number>();
  orders.forEach(o => {
    const date = o.created_at.split('T')[0]; // YYYY-MM-DD
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + Number(o.total_price || 0));
  });

  const sortedDays = Array.from(dailyRevenue.keys()).sort().reverse().slice(0, 30);
  const historyLabels = sortedDays.reverse(); // oldest → newest
  const historyValues = historyLabels.map(d => dailyRevenue.get(d) || 0);

  const trend = historyValues.length > 1 && historyValues[0] !== 0
    ? `${Math.sign(historyValues[historyValues.length - 1] - historyValues[0]) >= 0 ? '+' : ''}${Math.round(
        ((historyValues[historyValues.length - 1] - historyValues[0]) / historyValues[0]) * 100
      )}%`
    : '0%';

  // 3. Customer & repeat analysis
  const customerOrders = new Map<string | number, { count: number; revenue: number }>();
  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const entry = customerOrders.get(cid) || { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += Number(o.total_price || 0);
      customerOrders.set(cid, entry);
    }
  });

  const uniqueCustomers = customerOrders.size;
  const returningCustomers = Array.from(customerOrders.values()).filter(c => c.count > 1).length;
  const repeatPurchaseRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;

  // 4. LTV & breakdown
  const ltv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
  const returningCustomersLtv = returningCustomers > 0
    ? customerOrders.size > 0
      ? Array.from(customerOrders.values())
          .filter(c => c.count > 1)
          .reduce((sum, c) => sum + c.revenue, 0) / returningCustomers
      : 0
    : 0;

  const oneTimeLtv = (totalRevenue - (returningCustomersLtv * returningCustomers)) / (uniqueCustomers - returningCustomers) || 0;

  // 5. Churn (simple: % of customers who bought once and never returned)
  const oneTimeBuyers = Array.from(customerOrders.values()).filter(c => c.count === 1).length;
  const churnRate = uniqueCustomers > 0 ? (oneTimeBuyers / uniqueCustomers) * 100 : 0;

  // 6. Top channel
  const channelCounts = new Map<string, number>();
  orders.forEach(o => {
    const channel = o.source_name || 'Unknown';
    channelCounts.set(channel, (channelCounts.get(channel) || 0) + 1);
  });
  let topChannel = '—';
  let maxCount = 0;
  channelCounts.forEach((count, channel) => {
    if (count > maxCount) {
      maxCount = count;
      topChannel = channel;
    }
  });

  // 7. Retention rate (same as repeat purchase rate for simplicity)
  const retentionRate = repeatPurchaseRate;

  // 8. Cohort retention (basic monthly cohort – first purchase month)
  const cohortData = new Map<string, { first: number; retained: number }>();
  const firstPurchase = new Map<string | number, string>();

  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const month = o.created_at.slice(0, 7); // YYYY-MM
      if (!firstPurchase.has(cid)) {
        firstPurchase.set(cid, month);
        cohortData.set(month, { first: (cohortData.get(month)?.first || 0) + 1, retained: 0 });
      }
    }
  });

  // Count retained per cohort (customers who bought again in later months)
  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid) {
      const firstMonth = firstPurchase.get(cid);
      const currentMonth = o.created_at.slice(0, 7);
      if (firstMonth && currentMonth > firstMonth) {
        const cohort = cohortData.get(firstMonth);
        if (cohort) cohort.retained += 1;
      }
    }
  });

  const cohortRetention = Array.from(cohortData.entries()).map(([month, { first, retained }]) => ({
    cohort: month,
    size: first,
    retained,
    rate: first > 0 ? Number(((retained / first) * 100).toFixed(1)) : 0,
  }));

  // 9. Store health score (0–100) – example weighted formula
  const healthScore = Math.min(100,
    (totalRevenue > 0 ? 30 : 0) +
    (repeatPurchaseRate > 15 ? 20 : repeatPurchaseRate * 1.33) +
    (churnRate < 25 ? 20 : 0) +
    (ltv > 150 ? 15 : 0) +
    (topChannel !== '—' ? 15 : 0)
  );

  // 10. AI insight – make it feel premium
  let aiInsight = '';
  if (totalRevenue > 0) {
    aiInsight = `Store generating £${totalRevenue.toFixed(0)} • ${trend} trend • AOV £${averageOrderValue.toFixed(0)}`;
    if (repeatPurchaseRate > 20) aiInsight += ` • Strong loyalty (${repeatPurchaseRate.toFixed(0)}% repeat)`;
    if (churnRate > 20) aiInsight += ` • Churn alert (${churnRate.toFixed(1)}%) – prioritize win-backs`;
    aiInsight += ` • Top channel: ${topChannel} • Health score: ${healthScore}/100`;
  } else {
    aiInsight = 'No revenue yet – Shopify connected but no paid orders synced. Test an order or check webhooks.';
  }

  console.log('[METRICS-API] Returning full computed analytics suite');

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
      ratio: (ltv / 100).toFixed(1), // placeholder until CAC available
      ltv: Number(ltv.toFixed(0)),
      cac: 0, // TODO: integrate ad spend
    },
    acquisition: {
      top_channel: topChannel,
      acquisition_cost: 0,
    },
    retention: {
      rate: Number(retentionRate.toFixed(1)),
      repeat_purchase_rate: Number(repeatPurchaseRate.toFixed(1)),
    },
    ltv: {
      value: Number(ltv.toFixed(0)),
      breakdown: {
        one_time: Number(oneTimeLtv.toFixed(0)),
        returning: Number(returningCustomersLtv.toFixed(0)),
      },
      returning_customers_ltv: Number(returningCustomersLtv.toFixed(0)),
    },
    cohort_retention: {
      data: cohortRetention,
    },
    store_health_score: healthScore,
    ai_insight: aiInsight,
    connections: {
      shopify: shopifyConnected,
      ga4: ga4Connected,
      hubspot: hubspotConnected,
    },
    debug: {
      ordersProcessed: orders.length,
      uniqueCustomers,
      totalRevenueRaw: totalRevenue,
      returningCustomers,
    },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });