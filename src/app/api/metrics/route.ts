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

    // Debug logs from previous step (keep these for now)
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
  // TEMP DEBUG RESPONSE: Bypass original calculations and return simple computed metrics
  // This confirms if frontend can display real numbers from orders
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

  return NextResponse.json({
    debug: {
      message: 'DEBUG MODE ACTIVE: Bypassing full calcs — raw orders + basic metrics',
      userId: user.id,
      rowCount: orders.length,
      sampleOrder: orders[0] || null,
      allTotalPrices: orders.map(o => Number(o.total_price) || 0),
      sumCheck: totalRevenue
    },
    revenue: {
      total: totalRevenue,
      average_order_value: aov,
      trend: '+DEBUG',  // placeholder
      history: {
        labels: orders.map(o => new Date(o.created_at).toLocaleDateString()),
        values: orders.map(o => Number(o.total_price) || 0)
      }
    },
    connections: { 
      shopify: shopifyConnected, 
      ga4: ga4Connected, 
      hubspot: hubspotConnected 
    },
    ai_insight: 'DEBUG: Data loaded from DB successfully. Check if Revenue card shows real £ value (should be around 29.7 if all ~9.9).',
    // Add minimal other fields to avoid frontend crashes
    churn: { rate: 0, at_risk: 0 },
    performance: { ratio: '0.0', ltv: 0, cac: 0 },
    acquisition: { top_channel: '—', acquisition_cost: 0 },
    retention: { rate: 0 },
    returning_customers_ltv: 0,
    ltv_breakdown: { one_time: 0, returning: 0 },
    cohort_retention: { data: [] },
    store_health_score: 0
  });

  // ────────────────────────────────────────────────
  // Your original full calculations and return would go here (commented out for debug)
  // const ga4Data = ga4Connected ? await fetchGA4Data(user.id) : null;
  // const hubspotData = hubspotConnected ? await fetchHubSpotData(user.id) : null;
  // ... calculations ...
  // return NextResponse.json({ ...full object... });
}

export const OPTIONS = () => new Response(null, { status: 200 });