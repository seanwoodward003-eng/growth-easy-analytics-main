// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyCSRF } from '@/lib/auth';
import { getRow, run } from '@/lib/db';
import { DateTime } from 'luxon';

async function refreshGA4Token(userId: number): Promise<string | null> {
  const row = await getRow<{ ga4_refresh_token: string }>(
    'SELECT ga4_refresh_token FROM users WHERE id = ?',
    [userId]
  );
  if (!row?.ga4_refresh_token) return null;

  try {
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: row.ga4_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      await run(
        'UPDATE users SET ga4_access_token = ?, ga4_last_refreshed = ? WHERE id = ?',
        [data.access_token, new Date().toISOString(), userId]
      );
      return data.access_token;
    }
  } catch (e) {
    console.error('GA4 refresh failed:', e);
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const auth = await requireAuth();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  // RATE LIMIT: 6 syncs per hour per user (safe null check)
  const recentSyncs = await getRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM rate_limits 
     WHERE user_id = ? AND endpoint = 'sync' 
     AND timestamp > datetime('now', '-1 hour')`,
    [userId]
  );

  const syncCount = recentSyncs?.count ?? 0;

  if (syncCount >= 6) {
    return NextResponse.json(
      { error: 'Rate limit exceeded — maximum 6 syncs per hour' },
      { status: 429 }
    );
  }

  // Log this sync attempt
  await run(
    'INSERT INTO rate_limits (user_id, endpoint) VALUES (?, "sync")',
    [userId]
  );

  const user = await getRow<{
    shopify_shop: string | null;
    shopify_access_token: string | null;
    ga4_access_token: string | null;
    ga4_refresh_token: string | null;
    ga4_property_id: string | null;
    hubspot_refresh_token: string | null;
    hubspot_access_token: string | null;
    ga4_last_refreshed: string | null;
  }>(
    `SELECT shopify_shop, shopify_access_token, ga4_access_token, ga4_refresh_token, 
            ga4_property_id, hubspot_refresh_token, hubspot_access_token, ga4_last_refreshed 
     FROM users WHERE id = ?`,
    [userId]
  );

  if (!user) return NextResponse.json({ error: 'No user data' }, { status: 400 });

  let {
    shopify_shop,
    shopify_access_token,
    ga4_access_token,
    ga4_refresh_token,
    ga4_property_id,
    hubspot_refresh_token,
    hubspot_access_token,
    ga4_last_refreshed,
  } = user;

  let revenue = 0,
    churn_rate = 0,
    at_risk = 0,
    ltv = 0,
    cac = 0,
    top_channel = '',
    acquisition_cost = 0,
    retention_rate = 85;

  const now = DateTime.now().setZone('UTC');
  const monthAgo = now.minus({ months: 1 });

  if (shopify_shop && shopify_access_token) {
    try {
      const ordersResp = await fetch(
        `https://${shopify_shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${monthAgo.toISODate()}&limit=250`,
        { headers: { 'X-Shopify-Access-Token': shopify_access_token } }
      );
      if (ordersResp.ok) {
        const { orders } = await ordersResp.json();
        const recentOrders = orders.slice(-30);
        revenue = recentOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0);

        const canceled = orders.filter((o: any) => o.cancelled_at).length;
        const totalOrders = orders.length;
        churn_rate = totalOrders ? (canceled / totalOrders) * 100 : 0;

        const customerIds = new Set(orders.map((o: any) => o.customer?.id).filter(Boolean));
        if (customerIds.size > 0) ltv = (revenue / customerIds.size) * 3;

        const customersResp = await fetch(
          `https://${shopify_shop}/admin/api/2024-01/customers.json?limit=250`,
          { headers: { 'X-Shopify-Access-Token': shopify_access_token } }
        );
        if (customersResp.ok) {
          const { customers } = await customersResp.json();
          at_risk = customers.filter((c: any) => (c.orders_count || 0) === 0).length;
        }
      }
    } catch (e) {
      console.error('Shopify sync error:', e);
    }
  }

  if (ga4_property_id && ga4_access_token) {
    if (!ga4_last_refreshed || DateTime.fromISO(ga4_last_refreshed) < now.minus({ minutes: 50 })) {
      ga4_access_token = (await refreshGA4Token(userId)) || ga4_access_token;
    }

    try {
      const reportUrl = `https://analyticsdata.googleapis.com/v1/properties/${ga4_property_id}:runReport`;
      const headers = { Authorization: `Bearer ${ga4_access_token}`, 'Content-Type': 'application/json' };

      const channelPayload = {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        metrics: [{ name: 'newUsers' }],
      };

      const channelResp = await fetch(reportUrl, { method: 'POST', headers, body: JSON.stringify(channelPayload) });
      if (channelResp.ok) {
        const data = await channelResp.json();
        const rows = data.rows || [];
        if (rows.length > 0) {
          top_channel = rows[0].dimensionValues[0].value || 'Organic';
        }
      }
    } catch (e) {
      console.error('GA4 sync error:', e);
    }
  }

  if (hubspot_refresh_token && hubspot_access_token) {
    try {
      const contactsResp = await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_lifecyclestage',
        { headers: { Authorization: `Bearer ${hubspot_access_token}` } }
      );
      if (contactsResp.ok) {
        const { results } = await contactsResp.json();
        const retained = results.filter((c: any) =>
          ['customer', 'subscriber'].includes(c.properties?.hs_lifecyclestage)
        ).length;
        const total = results.length;
        retention_rate = total > 0 ? (retained / total) * 100 : retention_rate;
      }
    } catch (e) {
      console.error('HubSpot sync error:', e);
    }
  }

  if (!cac && revenue > 0) cac = revenue * 0.05;

  await run(
    `INSERT OR REPLACE INTO metrics 
     (user_id, date, revenue, churn_rate, at_risk, ltv, cac, top_channel, acquisition_cost, retention_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      now.toISO(),
      revenue,
      churn_rate,
      at_risk,
      ltv,
      cac,
      top_channel,
      acquisition_cost,
      retention_rate,
    ]
  );

  // Insert current metrics into history for anomaly detection
  await run(
    `INSERT INTO metrics_history (user_id, sync_date, revenue, churn_rate, at_risk, aov, repeat_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, now.toISODate(), revenue, churn_rate, at_risk, aov, repeatRate]
  );

  return NextResponse.json({
    status: 'Synced',
    revenue,
    churn_rate,
    at_risk,
    ltv,
    cac,
    top_channel,
    acquisition_cost,
    retention_rate,
  });
}

export const OPTIONS = () => new Response(null, { status: 200 });