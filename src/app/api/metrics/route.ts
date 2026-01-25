import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';
import { fetchGA4Data } from '@/lib/integrations/ga4';      // ← New import
import { fetchHubSpotData } from '@/lib/integrations/hubspot'; // ← New import

// Define the expected shape of each order row
type OrderRow = {
  total_price: number | string;
  created_at: string;
  customer_id: string | number | null;
  source_name: string | null;
  financial_status: string;
};

export async function GET() {
  console.log('[METRICS-API] ENDPOINT STARTED at', new Date().toISOString());

  const auth = await requireAuth();
  console.log('[METRICS-API] Auth completed — user ID:', auth.user?.id || 'unknown');

  if ('error' in auth) {
    console.log('[METRICS-API] Auth ERROR:', auth.error, 'status:', auth.status);
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const userId = auth.user.id;
  console.log('[METRICS-API] User authenticated — ID:', userId);

  const shopifyConnected = !!(auth.user.shopify_shop && auth.user.shopify_access_token);
  const ga4Connected = !!auth.user.ga4_connected;
  const hubspotConnected = !!auth.user.hubspot_connected;

  console.log('[METRICS-API] Connection flags:', {
    shopify: shopifyConnected,
    ga4: ga4Connected,
    hubspot: hubspotConnected,
    shop: auth.user.shopify_shop || 'not set',
  });

  // DEBUG: Before orders query
  console.log('[METRICS-API] Preparing to query orders table for user:', userId);

  let orders: OrderRow[] = [];
  try {
    orders = await getRows<OrderRow>(
      `SELECT total_price, created_at, customer_id, source_name, financial_status
       FROM orders
       WHERE user_id = ?
       AND financial_status IN ('paid', 'partially_paid')
       ORDER BY created_at DESC LIMIT 5000`,
      [userId]
    );
    console.log('[METRICS-API] ORDERS QUERY SUCCESS — found', orders.length, 'rows');
  } catch (queryErr) {
    console.error('[METRICS-API] ORDERS QUERY CRASHED:', queryErr instanceof Error ? queryErr.message : String(queryErr));
    console.error('[METRICS-API] Full query error stack:', queryErr);
  }

  if (orders.length === 0) {
    console.log('[METRICS-API] No paid orders found — returning empty state');
    const emptyState = {
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
      debug: { 
        message: 'No orders found — likely webhook sync issue or empty table',
        userId,
        shopifyShop: auth.user.shopify_shop || 'not set'
      },
    };
    console.log('[METRICS-API] Sending empty state response');
    return NextResponse.json(emptyState);
  }

  console.log('[METRICS-API] Orders found — starting calculations');

  // Revenue + AOV
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  console.log('[METRICS-API] Calculated revenue:', totalRevenue, 'AOV:', averageOrderValue);

  // History (daily – last 30 days)
  const dailyRevenue = new Map<string, number>();
  orders.forEach(o => {
    const date = o.created_at.split('T')[0];
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + Number(o.total_price || 0));
  });
  const sortedDays = Array.from(dailyRevenue.keys()).sort().reverse().slice(0, 30);
  const historyLabels = sortedDays.reverse();
  const historyValues = historyLabels.map(d => dailyRevenue.get(d) || 0);
  console.log('[METRICS-API] History labels:', historyLabels);
  console.log('[METRICS-API] History values:', historyValues);

  const trend = historyValues.length > 1 && historyValues[0] !== 0
    ? `${Math.sign(historyValues[historyValues.length - 1] - historyValues[0]) >= 0 ? '+' : ''}${Math.round(
        ((historyValues[historyValues.length - 1] - historyValues[0]) / historyValues[0]) * 100
      )}%`
    : '0%';
  console.log('[METRICS-API] Trend:', trend);

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
  const retentionRate = repeatPurchaseRate;
  console.log('[METRICS-API] Customers:', uniqueCustomers, 'returning:', returningCustomers, 'repeat rate:', repeatPurchaseRate);

  // LTV & breakdown
  const ltv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
  const returningLtv = returningCustomers > 0
    ? Array.from(customerMap.values())
        .filter(c => c.orders > 1)
        .reduce((s, c) => s + c.revenue, 0) / returningCustomers
    : 0;
  const oneTimeLtv = (totalRevenue - (returningLtv * returningCustomers)) / (uniqueCustomers - returningCustomers) || 0;
  console.log('[METRICS-API] LTV:', ltv, 'returning LTV:', returningLtv, 'one-time LTV:', oneTimeLtv);

  // Churn
  const oneTimeBuyers = Array.from(customerMap.values()).filter(c => c.orders === 1).length;
  const churnRate = uniqueCustomers > 0 ? (oneTimeBuyers / uniqueCustomers) * 100 : 0;
  console.log('[METRICS-API] Churn rate:', churnRate);

  // Top channel
  const channelMap = new Map<string, number>();
  orders.forEach(o => {
    const ch = o.source_name || 'Unknown';
    channelMap.set(ch, (channelMap.get(ch) || 0) + 1);
  });
  let topChannel = '—';
  let max = 0;
  channelMap.forEach((c, ch) => { if (c > max) { max = c; topChannel = ch; } });
  console.log('[METRICS-API] Top channel:', topChannel);

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
  console.log('[METRICS-API] Cohort retention calculated');

  // Store health score
  const healthScore = Math.min(100,
    (totalRevenue > 0 ? 30 : 0) +
    (repeatPurchaseRate > 20 ? 20 : repeatPurchaseRate * 1) +
    (churnRate < 25 ? 20 : 0) +
    (ltv > 150 ? 15 : 0) +
    (topChannel !== '—' ? 15 : 0)
  );
  console.log('[METRICS-API] Health score:', healthScore);

  // AI insight
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
  console.log('[METRICS-API] AI insight:', insight);

  // ────────────────────────────────────────────────────────────────
  // NEW: Fetch & merge GA4 + HubSpot data
  // ────────────────────────────────────────────────────────────────
  console.log('[METRICS-API] Fetching GA4 & HubSpot data...');

  const ga4Data = ga4Connected ? await fetchGA4Data(userId) : null;
  const hubspotData = hubspotConnected ? await fetchHubSpotData(userId) : null;

  // Merge GA4 data
  const sessions = ga4Data?.sessions || 0;
  const bounceRate = ga4Data?.bounceRate || 0;
  const topChannelFromGA4 = ga4Data?.topChannels?.[0]?.sourceMedium || topChannel; // Prefer GA4 if available
  const cacFromGA4 = ga4Data?.estimatedCac || 0;

  // Merge HubSpot data
  const atRiskFromHubSpot = hubspotData?.atRiskContacts || Math.round(uniqueCustomers * (churnRate / 100));
  const openRate = hubspotData?.openRate || 0;
  const clickRate = hubspotData?.clickRate || 0;

  // Enhanced AI insight with all sources
  let enhancedInsight = insight;
  if (sessions > 0) enhancedInsight += ` • Sessions: ${sessions} • Bounce: ${bounceRate.toFixed(1)}%`;
  if (cacFromGA4 > 0) enhancedInsight += ` • CAC: £${cacFromGA4.toFixed(2)}`;
  if (atRiskFromHubSpot > 0) enhancedInsight += ` • ${atRiskFromHubSpot} at-risk contacts (HubSpot)`;

  console.log('[METRICS-API] Enhanced insight:', enhancedInsight);

  console.log('[METRICS-API] Returning full metrics response');
  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      average_order_value: Number(averageOrderValue.toFixed(2)),
      trend,
      history: { labels: historyLabels, values: historyValues },
    },
    churn: {
      rate: Number(churnRate.toFixed(1)),
      at_risk: atRiskFromHubSpot, // ← Updated with HubSpot
    },
    performance: {
      ratio: (ltv / (cacFromGA4 || 100)).toFixed(1), // ← Real CAC if available
      ltv: Number(ltv.toFixed(0)),
      cac: cacFromGA4, // ← Real from GA4
    },
    acquisition: {
      top_channel: topChannelFromGA4, // ← Prefer GA4
      acquisition_cost: cacFromGA4,
    },
    retention: {
      rate: Number(retentionRate.toFixed(1)),
      repeat_purchase_rate: Number(repeatPurchaseRate.toFixed(1)),
    },
    traffic: {
      sessions,
      bounceRate: Number(bounceRate.toFixed(1)),
    },
    email: {
      openRate: Number(openRate.toFixed(1)),
      clickRate: Number(clickRate.toFixed(1)),
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
    ai_insight: enhancedInsight, // ← Enhanced version
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
      message: 'Full metrics calculated',
    },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });