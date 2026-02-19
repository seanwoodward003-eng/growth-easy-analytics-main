import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { requireAuth } from '@/lib/auth';  // ← ADD THIS IMPORT (fixes the error)
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

  // ────────────────────────────────────────────────────────────────
  // Step 1: Validate Shopify session token (Bearer header from frontend)
  // ────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');

  let user = null;
  let shopDomain = null;

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
        return NextResponse.json({ error: 'Invalid token audience' }, { status: 401 });
      }

      shopDomain = (payload.dest as string)?.replace('https://', '') ||
                   (payload.iss as string)?.replace('https://', '') ||
                   null;

      if (!shopDomain) {
        console.log('[METRICS-API] No shop domain in token');
        return NextResponse.json({ error: 'Missing shop domain in token' }, { status: 401 });
      }

      console.log('[METRICS-API] Token valid — shop domain:', shopDomain);

      const users = await getRows<any>(
        'SELECT * FROM users WHERE shopify_shop = ? LIMIT 1',
        [shopDomain]
      );

      if (users.length === 0) {
        console.log('[METRICS-API] No user found for shop:', shopDomain);
        return NextResponse.json({ error: 'User not found for shop' }, { status: 404 });
      }

      user = users[0];
      console.log('[METRICS-API] User loaded via shop domain — ID:', user.id);

    } catch (err) {
      console.error('[METRICS-API] Token validation failed:', err);
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 });
    }
  } else {
    // Fallback to old cookie-based auth
    const oldAuth = await requireAuth();  // Now imported, no error
    if ('error' in oldAuth) {
      console.log('[METRICS-API] Old auth failed:', oldAuth.error);
      return NextResponse.json({ error: oldAuth.error }, { status: oldAuth.status || 401 });
    }
    user = oldAuth.user;
    console.log('[METRICS-API] Fallback to old auth — user ID:', user.id);
  }

  // ────────────────────────────────────────────────────────────────
  // Rest of your original code (connections, orders query, calculations, GA4/HubSpot merge, response)
  // ────────────────────────────────────────────────────────────────
  const shopifyConnected = !!(user.shopify_shop && user.shopify_access_token);
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

  // ... (keep all your calculations, empty state, GA4/HubSpot merge, insight, final json response unchanged)

  return NextResponse.json({
    // Your full response object
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });