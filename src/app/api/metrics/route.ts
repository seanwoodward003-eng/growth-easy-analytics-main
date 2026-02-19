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

  // Step 1: Try Shopify embedded session token (Bearer)
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

  // Step 2: Fallback to old cookie-based auth if token failed or missing
  if (!user) {
    console.log('[METRICS-API] Falling back to old cookie auth');
    const oldAuth = await requireAuth();
    if ('error' in oldAuth) {
      console.log('[METRICS-API] Old auth failed:', oldAuth.error);
      // Return safe fallback data instead of error (prevents frontend crash)
      return NextResponse.json(getEmptyMetricsState('Old auth failed'));
    }
    user = oldAuth.user;
    console.log('[METRICS-API] Fallback to old auth — user ID:', user.id);
  }

  // ────────────────────────────────────────────────────────────────
  // Connection flags - FIXED: allow connected even if token is null
  // ────────────────────────────────────────────────────────────────
  const shopifyConnected = !!user.shopify_shop;  // MAIN FIX - only needs shop domain
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

  // If no orders or not connected, return safe empty state
  if (orders.length === 0 || !shopifyConnected) {
    return NextResponse.json(getEmptyMetricsState('No orders or not connected'));
  }

  // Your full calculations (revenue, AOV, history, customers, LTV, churn, top channel, cohort, health score, insight)
  // ... (keep all your existing code here unchanged)

  // Merge GA4/HubSpot (unchanged)
  const ga4Data = ga4Connected ? await fetchGA4Data(user.id) : null;
  const hubspotData = hubspotConnected ? await fetchHubSpotData(user.id) : null;

  // ... rest of your response logic (enhancedInsight, final json)

  // ────────────────────────────────────────────────────────────────
  // TEMP DEBUG: return raw data to see what the frontend gets
  // ────────────────────────────────────────────────────────────────
  console.log('[METRICS DEBUG] Raw data before response:', {
    ordersCount: orders.length,
    firstOrder: orders[0] || 'no orders',
    shopifyConnected,
    userId: user.id,
    shop: user.shopify_shop
  });

  return NextResponse.json({
    debug: 'Raw debug response - check if orders appear',
    orders: orders,
    connected: shopifyConnected,
    user: { id: user.id, shop: user.shopify_shop },
    // add any other calculated fields you have
  });

  // ... (your normal return JSON would go here - comment it out temporarily)
}

// Helper for safe empty state (prevents frontend crash on error)
function getEmptyMetricsState(reason: string) {
  return {
    revenue: { total: 0, average_order_value: 0, trend: '0%', history: { labels: [], values: [] } },
    churn: { rate: 0, at_risk: 0 },
    performance: { ratio: '0.0', ltv: 0, cac: 0 },
    acquisition: { top_channel: '—', acquisition_cost: 0 },
    retention: { rate: 0, repeat_purchase_rate: 0 },
    returning_customers_ltv: 0,
    ltv_breakdown: { one_time: 0, returning: 0 },
    cohort_retention: { data: [] },
    store_health_score: 0,
    ai_insight: `Data not available (${reason}). Connect Shopify or check logs.`,
    connections: { shopify: false, ga4: false, hubspot: false },
    debug: { message: 'Safe empty state - check connection/auth' }
  };
}

export const OPTIONS = () => new Response(null, { status: 200 });