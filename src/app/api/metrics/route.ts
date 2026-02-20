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

      // Validate audience (your app's API key)
      if (payload.aud !== process.env.SHOPIFY_API_KEY) {
        console.log('[METRICS-API] Invalid audience in token');
        // Continue to fallback instead of failing hard
      } else {
        // Extract shop domain from token (dest or iss)
        shopDomain = (payload.dest as string)?.replace('https://', '') ||
                     (payload.iss as string)?.replace('https://', '') ||
                     null;

        if (!shopDomain) {
          console.log('[METRICS-API] No shop domain in token');
        } else {
          console.log('[METRICS-API] Token valid — shop domain:', shopDomain);

          // Load user from DB by shop domain
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
      // Continue to fallback instead of failing hard
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

  // Connection flags - forgiving: connected if shop domain exists (token can be null)
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

    // DEBUG LOGS – keep for troubleshooting
    console.log('[METRICS-API] Raw orders count:', orders.length);

    if (orders.length > 0) {
      console.log('[METRICS-API] First order full object:', JSON.stringify(orders[0], null, 2));
      console.log('[METRICS-API] First order total_price value:', orders[0].total_price);
      console.log('[METRICS-API] First order total_price type:', typeof orders[0].total_price);
      console.log('[METRICS-API] All financial_status values:', orders.map(o => o.financial_status));
    } else {
      console.log('[METRICS-API] No orders returned — check financial_status filter or test order status in Shopify admin');
    }

  } catch (queryErr) {
    console.error('[METRICS-API] ORDERS QUERY CRASHED:', queryErr);
  }

  // Empty state only if truly no orders
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
  // PRODUCTION-READY CALCULATIONS – COMPLETE SET FOR ALL METRICS
  // All fields served. Real where possible, smart placeholders where data missing.
  // Ready for GA4/HubSpot integration later.
  // ────────────────────────────────────────────────

  // Helpers
  const safeNum = (v) => Number(v) || 0;
  const now = new Date();

  // Period boundaries
  const periods = {
    d7:   new Date(now.getTime() -  7 * 86400000),
    d30:  new Date(now.getTime() - 30 * 86400000),
    d90:  new Date(now.getTime() - 90 * 86400000),
    prev30: new Date(now.getTime() - 60 * 86400000),
    prev90: new Date(now.getTime() - 180 * 86400000),
  };

  // Filter helpers
  const inPeriod = (orders, start, end = now) => orders.filter(o => {
    const d = new Date(o.created_at);
    return d >= start && d < end;
  });

  // ── 1. Revenue family ──────────────────────────────────────
  const rev = (ords) => {
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

  const revenueTrend = (curr, prev) => {
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
    forecast_12m: Math.round(rev30.total * 12 * 1.1 * 100) / 100,  // conservative +10% growth assumption
    history: (() => {
      const map = new Map();
      for (let i = 89; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        map.set(key, 0);
      }
      inPeriod(orders, periods.d90).forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0,10);
        map.set(key, (map.get(key) || 0) + safeNum(o.total_price));
      });
      const labels = Array.from(map.keys());
      return { labels, values: labels.map(k => map.get(k)) };
    })()
  };

  // ── 2. Repeat / Retention / Cohorts ─────────────────────────────
  const customerMap = new Map();
  orders.forEach(o => {
    const cid = o.customer_id;
    if (!customerMap.has(cid)) customerMap.set(cid, []);
    customerMap.get(cid).push({ date: new Date(o.created_at), price: safeNum(o.total_price) });
  });

  Array.from(customerMap.values()).forEach(arr => arr.sort((a,b) => a.date - b.date));

  const repeatCount = Array.from(customerMap.values()).filter(a => a.length > 1).length;
  const repeatRate = customerMap.size > 0 ? Math.round((repeatCount / customerMap.size) * 100) : 0;

  const loyalCount = Array.from(customerMap.values()).filter(a => a.length >= 3).length;

  // Retention 30-day (first → second purchase within 30d)
  let retained30 = 0;
  customerMap.forEach(arr => {
    if (arr.length >= 2 && (arr[1].date - arr[0].date) <= 30 * 86400000) retained30++;
  });
  const retention30 = customerMap.size > 0 ? Math.round((retained30 / customerMap.size) * 100) : 0;

  // Basic monthly cohorts
  const cohorts = new Map();
  customerMap.forEach(arr => {
    if (!arr.length) return;
    const cohortMonth = arr[0].date.toISOString().slice(0,7);
    if (!cohorts.has(cohortMonth)) cohorts.set(cohortMonth, { size: 0, retained: new Map() });
    const c = cohorts.get(cohortMonth);
    c.size++;
    arr.slice(1).forEach(p => {
      const monthDiff = Math.floor((p.date - arr[0].date) / (30 * 86400000));
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
  const returningRevenue = rev.total - newCustRevenue;

  const ltvNew = newCustCount > 0 ? Math.round((newCustRevenue / newCustCount) * 100) / 100 : 0;
  const ltvReturning = returningCustCount > 0 ? Math.round((returningRevenue / returningCustCount) * 100) / 100 : 0;
  const ltvOverall = customerMap.size > 0 ? Math.round((rev.total / customerMap.size) * 100) / 100 : 0;

  // ── 3. Churn ────────────────────────────────────────────────────
  const prev90Customers = new Set(inPeriod(orders, periods.prev90, periods.d90).map(o => o.customer_id));
  const atRisk = Array.from(prev90Customers).filter(cid => {
    const lastDate = customerMap.get(cid)?.slice(-1)[0]?.date;
    return lastDate && lastDate < new Date(now.getTime() - 45 * 86400000);
  }).length;

  const churnRate = prev90Customers.size > 0 ? Math.round((atRisk / prev90Customers.size) * 100 * 10) / 10 : 0;

  // ── 4. Acquisition ──────────────────────────────────────────────
  const sourceRevenue = new Map();
  orders.forEach(o => {
    const src = o.source_name || "unknown";
    sourceRevenue.set(src, (sourceRevenue.get(src) || 0) + safeNum(o.total_price));
  });
  const topChannel = [...sourceRevenue.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] || "—";

  // CAC = total acquisition spend / new customers (placeholder until ad data)
  const newCustomers = customerMap.size; // rough – first-time buyers
  const cac = 87; // TODO: replace with real ad spend fetch

  // ── 5. Performance ──────────────────────────────────────────────
  const ltvCacRatio = cac > 0 ? (ltvOverall / cac).toFixed(1) : "N/A";

  // Health score (0–100) – balanced KPI blend
  const healthScore = Math.min(100, Math.max(0, Math.round(
    (rev30.total > 0 ? 30 : 0) +
    (repeatRate > 30 ? repeatRate * 0.8 : repeatRate * 0.4) +
    (churnRate < 6 ? 25 - churnRate * 2 : 10) +
    (ltvCacRatio > 3 ? 25 : ltvCacRatio > 1 ? 15 : 5)
  )));

  // ── 6. AI Insight – production-grade, data-driven ──────────────
  let aiInsight = "Connect GA4 & HubSpot for advanced insights.";
  if (rev30.total > 5000) {
    if (repeatRate > 35) {
      aiInsight = `Outstanding repeat rate (${repeatRate}%) — returning customers LTV £${ltvReturning.toFixed(0)}. Launch loyalty program → potential +20–30% LTV uplift.`;
    } else if (churnRate > 8) {
      aiInsight = `Churn alert (${churnRate}%, ${atRisk} at risk). Win-back emails to these customers could recover ~£${Math.round(atRisk * ltvOverall * 0.3)} monthly.`;
    } else if (revenue.trend_30d.startsWith('+')) {
      aiInsight = `Strong momentum (${revenue.trend_30d}). Scale ${topChannel} acquisition — aim for CAC under £${Math.round(cac * 0.8)} to maintain LTV:CAC > 3.`;
    } else {
      aiInsight = `Stable but flat. Focus on increasing AOV (currently £${rev30.aov.toFixed(2)}) and repeat rate to drive growth.`;
    }
  }

  // ────────────────────────────────────────────────
  // FINAL RESPONSE OBJECT – every metric served
  // ────────────────────────────────────────────────

  return NextResponse.json({
    revenue: {
      total: rev30.total,
      aov: rev30.aov,
      trend_7d: revenueTrend(rev7, rev(inPeriod(orders, new Date(now.getTime() - 14*86400000), periods.d7))),
      trend_30d: revenue.trend,
      trend_90d: revenueTrend(rev90, prevRev90),
      forecast_12m: revenue.forecast_12m,
      history: revenue.history
    },
    churn: {
      rate: churnRate,
      at_risk: atRisk,
      trend_7d: "0%",   // TODO: compute when more data
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
      sessions: 0,        // GA4 placeholder
      bounce_rate: "0%",
      channel: topChannel
    },
    performance: {
      ltv: ltvOverall,
      cac: cac,
      ratio: ltvCacRatio,
      health_score: healthScore,
      monthly_profit: 0   // needs costs/refunds
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