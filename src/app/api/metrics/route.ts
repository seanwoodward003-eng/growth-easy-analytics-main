import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { requireAuth } from '@/lib/auth';
import { getRows } from '@/lib/db';
import { fetchGA4Data, GA4Data } from '@/lib/integrations/ga4';
import { fetchHubSpotData, HubSpotData } from '@/lib/integrations/hubspot';

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
  } catch (queryErr) {
    console.error('[METRICS-API] ORDERS QUERY CRASHED:', queryErr);
  }

  if (orders.length === 0) {
    const emptyState = {
      revenue: { total: 0, average_order_value: 0, trend_7d: '0%', trend_30d: '0%', trend_90d: '0%', forecast_12m: 0, history: { labels: [], values: [] } },
      churn: { rate: 0, at_risk: 0, trend_7d: '0%', trend_30d: '0%', trend_90d: '0%' },
      performance: { ratio: '0.0', ltv: 0, cac: 0, health_score: 0, monthly_profit: 0 },
      acquisition: { top_channel: '—', acquisition_cost: 0, cost_trend_30d: 'N/A', cost_trend_90d: 'N/A', sessions: 0, bounce_rate: '0%', channel: '—' },
      retention: { rate: 0, repeat_rate: 0, loyal_count: 0, cohort_retention: { data: [] }, thirty_day: 0 },
      returning_customers_ltv: 0,
      ltv_breakdown: { one_time: 0, returning: 0 },
      new_customers_ltv: 0,
      email_open_rate: null,
      email_click_rate: null,
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
  // HELPERS
  // ────────────────────────────────────────────────

  const safeNum = (v: number | string) => Number(v) || 0;
  const now = new Date();

  const periods = {
    d7:    new Date(now.getTime() -  7 * 86400000),
    d14:   new Date(now.getTime() - 14 * 86400000),
    d30:   new Date(now.getTime() - 30 * 86400000),
    d60:   new Date(now.getTime() - 60 * 86400000),
    d90:   new Date(now.getTime() - 90 * 86400000),
    d180:  new Date(now.getTime() - 180 * 86400000),
  };

  const inPeriod = (ords: OrderRow[], start: Date, end = now) =>
    ords.filter(o => {
      const d = new Date(o.created_at);
      return d >= start && d < end;
    });

  const rev = (ords: OrderRow[]) => {
    const total = ords.reduce((s, o) => s + safeNum(o.total_price), 0);
    return {
      total: Math.round(total * 100) / 100,
      count: ords.length,
      aov: ords.length > 0 ? Math.round((total / ords.length) * 100) / 100 : 0,
    };
  };

  // ────────────────────────────────────────────────
  // REVENUE CALCULATIONS
  // ────────────────────────────────────────────────

  const rev7   = rev(inPeriod(orders, periods.d7));
  const rev30  = rev(inPeriod(orders, periods.d30));
  const rev90  = rev(inPeriod(orders, periods.d90));

  const prevRev7  = rev(inPeriod(orders, periods.d14, periods.d7));
  const prevRev30 = rev(inPeriod(orders, periods.d60, periods.d30));
  const prevRev90 = rev(inPeriod(orders, periods.d180, periods.d90));

  const revenueTrend = (curr: { total: number }, prev: { total: number }) => {
    if (prev.total === 0) return curr.total > 0 ? "+∞" : "0%";
    const pct = ((curr.total - prev.total) / prev.total) * 100;
    return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  };

  const revenueHistory = (() => {
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
  })();

  // ────────────────────────────────────────────────
  // CUSTOMER & RETENTION CALCULATIONS
  // ────────────────────────────────────────────────

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

  // Cohort retention
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

  // LTV breakdown
  const newCustCount = Array.from(customerMap.values()).filter(a => a.length === 1).length;
  const returningCustCount = repeatCount;
  const newCustRevenue = Array.from(customerMap.values())
    .filter(a => a.length === 1)
    .reduce((s, a) => s + a[0].price, 0);
  const returningRevenue = rev30.total - newCustRevenue;

  const ltvNew = newCustCount > 0 ? Math.round((newCustRevenue / newCustCount) * 100) / 100 : 0;
  const ltvReturning = returningCustCount > 0 ? Math.round((returningRevenue / returningCustCount) * 100) / 100 : 0;
  const ltvOverall = customerMap.size > 0 ? Math.round((rev30.total / customerMap.size) * 100) / 100 : 0;

  // ────────────────────────────────────────────────
  // CHURN CALCULATIONS + TRENDS
  // ────────────────────────────────────────────────

  const getChurnForPeriod = (lookbackStart: Date, lookbackEnd: Date, silentPeriodDays = 45) => {
    const prevCustomers = new Set(
      inPeriod(orders, lookbackStart, lookbackEnd)
        .map(o => o.customer_id)
        .filter((cid): cid is string | number => cid != null)
    );
    let atRisk = 0;
    prevCustomers.forEach(cid => {
      const ordersForCid = customerMap.get(cid);
      if (!ordersForCid || ordersForCid.length === 0) return;
      const lastDate = ordersForCid[ordersForCid.length - 1].date;
      if (lastDate.getTime() < now.getTime() - silentPeriodDays * 86400000) atRisk++;
    });
    return {
      rate: prevCustomers.size > 0 ? Math.round((atRisk / prevCustomers.size) * 100 * 10) / 10 : 0,
      atRisk,
    };
  };

  const currentChurn = getChurnForPeriod(periods.d90, periods.d180);
  const churn7d  = getChurnForPeriod(new Date(now.getTime() - 14*86400000), periods.d7);
  const churn30d = getChurnForPeriod(periods.d60, periods.d30);
  const churn90d = getChurnForPeriod(periods.d180, periods.d90);

  const churnTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+∞" : "0%";
    const pct = ((curr - prev) / prev) * 100;
    return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  };

  // ────────────────────────────────────────────────
  // ACQUISITION + SOURCE
  // ────────────────────────────────────────────────

  const sourceRevenue = new Map<string, number>();
  orders.forEach(o => {
    const src = o.source_name || "unknown";
    sourceRevenue.set(src, (sourceRevenue.get(src) || 0) + safeNum(o.total_price));
  });
  const topChannel = [...sourceRevenue.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] || "—";

  let cac = 87; // fallback

  // ────────────────────────────────────────────────
  // GA4 & HUBSPOT INTEGRATION
  // ────────────────────────────────────────────────

  let ga4Data: GA4Data | null = null;
  if (ga4Connected) {
    ga4Data = await fetchGA4Data(user.id);
    if (ga4Data) {
      cac = ga4Data.estimatedCac || cac;
    }
  }

  let hubspotData: HubSpotData | null = null;
  let emailOpenRate: number | null = null;
  let emailClickRate: number | null = null;

  if (hubspotConnected) {
    hubspotData = await fetchHubSpotData(user.id);
    if (hubspotData) {
      currentChurn.atRisk = hubspotData.atRiskContacts || currentChurn.atRisk;
      emailOpenRate = hubspotData.openRate || null;
      emailClickRate = hubspotData.clickRate || null;
    }
  }

  // ────────────────────────────────────────────────
  // HEALTH SCORE & INSIGHT
  // ────────────────────────────────────────────────

  const ltvCacRatioNum = cac > 0 ? ltvOverall / cac : 0;

  const healthScore = Math.min(100, Math.max(0, Math.round(
    (rev30.total > 0 ? 30 : 0) +
    (repeatRate > 30 ? repeatRate * 0.8 : repeatRate * 0.4) +
    (currentChurn.rate < 6 ? 25 - currentChurn.rate * 2 : 10) +
    (ltvCacRatioNum > 3 ? 25 : ltvCacRatioNum > 1 ? 15 : 5)
  )));

  let aiInsight = "Connect GA4 & HubSpot for advanced insights.";
  if (ga4Data?.sessions) {
    aiInsight += ` GA4 shows ${ga4Data.sessions} sessions with ${ga4Data.bounceRate?.toFixed(1) ?? 0}% bounce.`;
  }
  if (emailOpenRate !== null) {
    aiInsight += ` HubSpot email open rate: ${emailOpenRate}%.`;
  }
  if (emailClickRate !== null) {
    aiInsight += ` Click rate: ${emailClickRate}%.`;
  }

  // ────────────────────────────────────────────────
  // FINAL RESPONSE
  // ────────────────────────────────────────────────

  return NextResponse.json({
    revenue: {
      total: rev30.total,
      average_order_value: rev30.aov,
      trend_7d: revenueTrend(rev7, prevRev7),
      trend_30d: revenueTrend(rev30, prevRev30),
      trend_90d: revenueTrend(rev90, prevRev90),
      forecast_12m: Math.round(rev30.total * 12 * 1.1 * 100) / 100,
      history: revenueHistory,
    },
    churn: {
      rate: currentChurn.rate,
      at_risk: currentChurn.atRisk,
      trend_7d: churnTrend(currentChurn.rate, churn7d.rate),
      trend_30d: churnTrend(currentChurn.rate, churn30d.rate),
      trend_90d: churnTrend(currentChurn.rate, churn90d.rate),
    },
    retention: {
      rate: retention30,
      repeat_rate: repeatRate,
      loyal_count: loyalCount,
      cohort_retention: { data: cohortRetention },
      thirty_day: retention30,
    },
    acquisition: {
      top_channel: topChannel,
      acquisition_cost: cac,
      cost_trend_30d: "N/A – historical CAC required", // ← improve when you store historical CAC
      cost_trend_90d: "N/A – historical CAC required",
      sessions: ga4Data?.sessions || 0,
      bounce_rate: ga4Data?.bounceRate ? `${(ga4Data.bounceRate * 100).toFixed(1)}%` : "0%",
      channel: topChannel,
    },
    performance: {
      ltv: ltvOverall,
      cac: cac,
      ratio: ltvCacRatioNum.toFixed(1),
      health_score: healthScore,
      monthly_profit: 0, // needs COGS + expenses
    },
    ltv_breakdown: {
      one_time: Math.round(newCustRevenue * 100) / 100,
      returning: Math.round(returningRevenue * 100) / 100,
    },
    new_customers_ltv: ltvNew,
    returning_customers_ltv: ltvReturning,
    email_open_rate: emailOpenRate,
    email_click_rate: emailClickRate,
    ai_insight: aiInsight,
    connections: {
      shopify: shopifyConnected,
      ga4: ga4Connected,
      hubspot: hubspotConnected,
    },
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });