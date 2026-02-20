import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';
import { fetchGA4Data } from '@/lib/integrations/ga4';
import { fetchHubSpotData } from '@/lib/integrations/hubspot';

// Define OrderRow type
type OrderRow = {
  total_price: number | string;
  created_at: string;
  customer_id: string | number | null;
  source_name: string | null;
  financial_status: string;
};

export async function GET(request: Request) {
  console.log('[METRICS-API] ENDPOINT STARTED at', new Date().toISOString());

  let user = null;
  let shopDomain = null;

  const authHeader = request.headers.get('authorization');

  // Step 1: Validate Shopify embedded session token (Bearer header)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SHOPIFY_API_SECRET!),
        { algorithms: ['HS256'] }
      );

      if (payload.aud !== process.env.SHOPIFY_API_KEY) {
        console.log('[METRICS-API] Invalid audience in token');
      } else {
        shopDomain = (payload.dest as string)?.replace('https://', '') ||
                     (payload.iss as string)?.replace('https://', '') ||
                     null;

        if (shopDomain) {
          console.log('[METRICS-API] Token valid — shop domain:', shopDomain);

          const users = await getRows<any>(
            'SELECT * FROM users WHERE shopify_shop = ? LIMIT 1',
            [shopDomain]
          );

          if (users.length > 0) {
            user = users[0];
            console.log('[METRICS-API] User loaded via shop domain — ID:', user.id);
          } else {
            console.log('[METRICS-API] No user found for shop:', shopDomain);
          }
        }
      }
    } catch (err) {
      console.error('[METRICS-API] Token validation failed:', err);
    }
  }

  // Step 2: Fallback to old cookie-based auth
  if (!user) {
    console.log('[METRICS-API] Falling back to old cookie auth');
    const oldAuth = await requireAuth();
    if ('error' in oldAuth) {
      console.log('[METRICS-API] Old auth failed:', oldAuth.error);
      return NextResponse.json({ error: oldAuth.error }, { status: oldAuth.status || 401 });
    }
    user = oldAuth.user;
    console.log('[METRICS-API] Fallback to old auth — user ID:', user.id);
  }

  // Connection flags
  const shopifyConnected = !!user.shopify_shop;
  const ga4Connected = !!user.ga4_connected;
  const hubspotConnected = !!user.hubspot_connected;

  console.log('[METRICS-API] Connection flags:', {
    shopify: shopifyConnected,
    ga4: ga4Connected,
    hubspot: hubspotConnected,
    shop: user.shopify_shop || 'not set',
  });

  let orders: OrderRow[] = [];
  try {
    orders = await getRows<OrderRow>(
      `SELECT total_price, created_at, customer_id, source_name, financial_status
       FROM orders
       WHERE user_id = ?
       AND financial_status IN ('paid', 'partially_paid')
       ORDER BY created_at DESC LIMIT 5000`,
      [user.id]
    );
    console.log('[METRICS-API] ORDERS QUERY SUCCESS — found', orders.length, 'rows');

    // Debug logs
    console.log('[METRICS-API] Raw orders count:', orders.length);
    if (orders.length > 0) {
      console.log('[METRICS-API] First order full object:', JSON.stringify(orders[0], null, 2));
      console.log('[METRICS-API] First order total_price value:', orders[0].total_price);
      console.log('[METRICS-API] First order total_price type:', typeof orders[0].total_price);
      console.log('[METRICS-API] All financial_status values:', orders.map(o => o.financial_status));
    }
  } catch (queryErr) {
    console.error('[METRICS-API] ORDERS QUERY CRASHED:', queryErr);
  }

  // Empty state if no orders
  if (orders.length === 0) {
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
        userId: user.id,
        shopifyShop: user.shopify_shop || 'not set'
      },
    };
    return NextResponse.json(emptyState);
  }

  // ────────────────────────────────────────────────
  // PRODUCTION CALCULATIONS + GA4 + HubSpot INTEGRATION
  // ────────────────────────────────────────────────

  const safeNum = (v: number | string) => Number(v) || 0;
  const now = new Date();

  const periods = {
    d7:   new Date(now.getTime() -  7 * 86400000),
    d30:  new Date(now.getTime() - 30 * 86400000),
    d90:  new Date(now.getTime() - 90 * 86400000),
    prev30: new Date(now.getTime() - 60 * 86400000),
    prev90: new Date(now.getTime() - 180 * 86400000),
  };

  const inPeriod = (orders: OrderRow[], start: Date, end = now) => orders.filter(o => {
    const d = new Date(o.created_at);
    return d >= start && d < end;
  });

  const rev = (ords: OrderRow[]) => {
    const total = ords.reduce((s, o) => s + safeNum(o.total_price), 0);
    return {
      total: Math.round(total * 100) / 100,
      count: ords.length,
      aov: ords.length > 0 ? Math.round((total / ords.length) * 100) / 100 : 0
    };
  };

  const rev7   = rev(inPeriod(orders, periods.d7));
  const rev30  = rev(inPeriod(orders, periods.d30));
  const rev90  = rev(inPeriod(orders, periods.d90));

  const prevRev30 = rev(inPeriod(orders, periods.prev30, periods.d30));
  const prevRev90 = rev(inPeriod(orders, periods.prev90, periods.d90));

  const revenueTrend = (curr: ReturnType<typeof rev>, prev: ReturnType<typeof rev>) => {
    if (prev.total === 0) return curr.total > 0 ? "+∞" : "0%";
    const pct = ((curr.total - prev.total) / prev.total) * 100;
    return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  };

  const revenue = {
    total: rev30.total,
    aov: rev30.aov,
    trend_7d:   revenueTrend(rev7, rev(inPeriod(orders, new Date(now.getTime() - 14*86400000), periods.d7))),
    trend_30d:  revenueTrend(rev30, prevRev30),
    trend_90d:  revenueTrend(rev90, prevRev90),
    forecast_12m: Math.round(rev30.total * 12 * 1.1 * 100) / 100,
    history: (() => {
      const map = new Map<string, number>();
      for (let i = 89; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        map.set(key, 0);
      }
      inPeriod(orders, periods.d90).forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0,10);
        if (map.has(key)) map.set(key, (map.get(key) || 0) + safeNum(o.total_price));
      });
      const labels = Array.from(map.keys());
      return { labels, values: labels.map(k => map.get(k) || 0) };
    })()
  };

  // Customer-level logic (repeat, LTV, cohorts, churn)
  const customerMap = new Map<string | number, { date: Date; price: number }[]>();
  orders.forEach(o => {
    const cid = o.customer_id;
    if (cid == null) return;
    if (!customerMap.has(cid)) customerMap.set(cid, []);
    customerMap.get(cid)!.push({ date: new Date(o.created_at), price: safeNum(o.total_price) });
  });

  Array.from(customerMap.values()).forEach(arr => arr.sort((a,b) => a.date.getTime() - b.date.getTime()));

  const repeatCount = Array.from(customerMap.values()).filter(a => a.length > 1).length;
  const repeatRate = customerMap.size > 0 ? Math.round((repeatCount / customerMap.size) * 100) : 0;

  const loyalCount = Array.from(customerMap.values()).filter(a => a.length >= 3).length;

  let retained30 = 0;
  customerMap.forEach(arr => {
    if (arr.length >= 2 && (arr[1].date.getTime() - arr[0].date.getTime()) <= 30 * 86400000) retained30++;
  });
  const retention30 = customerMap.size > 0 ? Math.round((retained30 / customerMap.size) * 100) : 0;

  // Cohorts...
  const cohorts = new Map<string, { size: number; retained: Map<number, number> }>();
  customerMap.forEach(arr => {
    if (!arr.length) return;
    const cohortMonth = arr[0].date.toISOString().slice(0,7);
    if (!cohorts.has(cohortMonth)) cohorts.set(cohortMonth, { size: 0, retained: new Map() });
    const c = cohorts.get(cohortMonth)!;
    c.size++;
    arr.slice(1).forEach(p => {
      const monthDiff = Math.floor((p.date.getTime() - arr[0].date.getTime()) / (30 * 86400000));
      if (monthDiff > 0) c.retained.set(monthDiff, (c.retained.get(monthDiff) || 0) + 1);
    });
  });

  const cohortRetention = Array.from(cohorts.entries()).map(([month, c]) => ({
    cohort: month,
    size: c.size,
    retentionCurve: Array.from({length: 12}, (_, i) => {
      const r = c.retained.get(i+1) || 0;
      return c.size > 0 ? Math.round((r / c.size) * 100) : 0;
    })
  }));

  const newCustCount = Array.from(customerMap.values()).filter(a => a.length === 1).length;
  const returningCustCount = repeatCount;
  const newCustRevenue = Array.from(customerMap.values())
    .filter(a => a.length === 1)
    .reduce((s, a) => s + a[0].price, 0);
  const returningRevenue = rev30.total - newCustRevenue;

  const ltvNew = newCustCount > 0 ? Math.round((newCustRevenue / newCustCount) * 100) / 100 : 0;
  const ltvReturning = returningCustCount > 0 ? Math.round((returningRevenue / returningCustCount) * 100) / 100 : 0;
  const ltvOverall = customerMap.size > 0 ? Math.round((rev30.total / customerMap.size) * 100) / 100 : 0;

  // FIXED CHURN SECTION
  const prev90Customers = new Set(
    inPeriod(orders, periods.prev90, periods.d90)
      .map(o => o.customer_id)
      .filter((cid): cid is string | number => cid != null)
  );

  const atRisk = Array.from(prev90Customers).filter(cid => {
    const ordersForCid = customerMap.get(cid);
    if (!ordersForCid || ordersForCid.length === 0) return false;
    const lastDate = ordersForCid[ordersForCid.length - 1].date;
    return lastDate.getTime() < now.getTime() - 45 * 86400000;
  }).length;

  const churnRate = prev90Customers.size > 0 
    ? Math.round((atRisk / prev90Customers.size) * 100 * 10) / 10 
    : 0;

  const sourceRevenue = new Map<string, number>();
  orders.forEach(o => {
    const src = o.source_name || "unknown";
    sourceRevenue.set(src, (sourceRevenue.get(src) || 0) + safeNum(o.total_price));
  });
  const topChannel = [...sourceRevenue.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] || "—";

  const newCustomers = customerMap.size;
  let cac = 87; // default placeholder

  // FIXED LTV:CAC RATIO – keep as number for comparisons
  const ltvCacRatioNum = cac > 0 ? ltvOverall / cac : 0;

  // Health score
  const healthScore = Math.min(100, Math.max(0, Math.round(
    (rev30.total > 0 ? 30 : 0) +
    (repeatRate > 30 ? repeatRate * 0.8 : repeatRate * 0.4) +
    (churnRate < 6 ? 25 - churnRate * 2 : 10) +
    (ltvCacRatioNum > 3 ? 25 : ltvCacRatioNum > 1 ? 15 : 5)
  )));

  let aiInsight = "Connect GA4 & HubSpot for advanced insights.";

  // ────────────────────────────────────────────────
  // INTEGRATE GA4 & HubSpot (when connected)
  // ────────────────────────────────────────────────

  let ga4Data: GA4Data | null = null;
  if (ga4Connected) {
    ga4Data = await fetchGA4Data(user.id);
    if (ga4Data) {
      revenue.history.values = ga4Data.history?.values || revenue.history.values;
      cac = ga4Data.estimatedCac || cac;
      acquisition.sessions = ga4Data.sessions || 0;
      acquisition.bounce_rate = ga4Data.bounceRate ? `${(ga4Data.bounceRate * 100).toFixed(1)}%` : "0%";
      acquisition.top_channel = ga4Data.topChannels[0]?.sourceMedium || topChannel;
      if (ga4Data.sessions > 0) {
        aiInsight += ` GA4 shows ${ga4Data.sessions} sessions with ${ga4Data.bounceRate.toFixed(1)}% bounce.`;
      }
    }
  }

  let hubspotData: HubSpotData | null = null;
  if (hubspotConnected) {
    hubspotData = await fetchHubSpotData(user.id);
    if (hubspotData) {
      churn.at_risk = hubspotData.atRiskContacts || churn.at_risk;
      if (hubspotData.openRate > 0) {
        aiInsight += ` HubSpot email open rate: ${hubspotData.openRate}%.`;
      }
      if (hubspotData.clickRate > 0) {
        aiInsight += ` Click rate: ${hubspotData.clickRate}%.`;
      }
    }
  }

  // ────────────────────────────────────────────────
  // FINAL RESPONSE – all metrics served
  // ────────────────────────────────────────────────

  return NextResponse.json({
    revenue: {
      total: rev30.total,
      aov: rev30.aov,
      trend_7d: revenueTrend(rev7, rev(inPeriod(orders, new Date(now.getTime() - 14*86400000), periods.d7))),
      trend_30d: revenueTrend(rev30, prevRev30),
      trend_90d: revenueTrend(rev90, prevRev90),
      forecast_12m: revenue.forecast_12m,
      history: revenue.history
    },
    churn: {
      rate: churnRate,
      at_risk: atRisk,
      trend_7d: "0%",
      trend_30d: "0%",
      trend_90d: "0%"
    },
    retention: {
      rate: retention30,
      repeat_rate: repeatRate,
      loyal_count: loyalCount,
      cohort_retention: { data: cohortRetention },
      thirty_day: retention30
    },
    acquisition: {
      top_channel: topChannel,
      cac: cac,
      cost_trend_30d: "N/A",
      cost_trend_90d: "N/A",
      sessions: ga4Data?.sessions || 0,
      bounce_rate: ga4Data ? `${(ga4Data.bounceRate * 100).toFixed(1)}%` : "0%",
      channel: topChannel
    },
    performance: {
      ltv: ltvOverall,
      cac: cac,
      ratio: ltvCacRatioNum.toFixed(1),  // format here
      health_score: healthScore,
      monthly_profit: 0
    },
    ltv_breakdown: {
      one_time: Math.round(newCustRevenue * 100) / 100,
      returning: Math.round(returningRevenue * 100) / 100
    },
    new_customers_ltv: ltvNew,
    returning_customers_ltv: ltvReturning,
    ai_insight: aiInsight,
    connections: {
      shopify: shopifyConnected,
      ga4: ga4Connected,
      hubspot: hubspotConnected
    }
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });