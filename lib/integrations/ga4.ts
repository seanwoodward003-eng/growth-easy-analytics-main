// lib/integrations/ga4.ts
import { run } from '@/lib/db';

export interface GA4Data {
  sessions: number;
  users: number;
  bounceRate: number;
  topChannels: Array<{
    sourceMedium: string;
    sessions: number;
    revenue: number;
    conversionRate: number;
  }>;
  deviceBreakdown: { [device: string]: number };
  estimatedCac: number;
}

export async function fetchGA4Data(userId: number): Promise<GA4Data | null> {
  try {
    // Get stored tokens – NO generic here (your run doesn't support it)
    const userRow = await run(
      'SELECT ga4_access_token, ga4_refresh_token, ga4_property_id FROM users WHERE id = ?',
      [userId]
    );

    // Safe null/undefined check
    if (!userRow || !userRow.ga4_property_id || !userRow.ga4_access_token) {
      console.log('[GA4] Missing property ID or access token for user', userId);
      return null;
    }

    let accessToken = userRow.ga4_access_token as string;
    const propertyId = userRow.ga4_property_id as string;

    // Simple token check (expand with full refresh if needed)
    const testResp = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [{ name: 'sessions' }],
        }),
      }
    );

    if (testResp.status === 401) {
      console.warn('[GA4] Token expired – refresh needed for user', userId);
      // TODO: Implement full refresh using ga4_refresh_token if you have it
      return null;
    }

    if (!testResp.ok) {
      console.error('[GA4] API test failed:', await testResp.text());
      return null;
    }

    // Main report – last 30 days
    const report = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'users' },
            { name: 'bounceRate' },
            { name: 'ecommerceRevenue' },
            { name: 'conversions' },
          ],
          dimensions: [
            { name: 'sourceMedium' },
            { name: 'deviceCategory' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),
      }
    );

    if (!report.ok) {
      console.error('[GA4] Main report failed:', await report.text());
      return null;
    }

    const data = await report.json();
    const rows = data.rows || [];

    // Parse results
    let sessions = 0;
    let users = 0;
    let bounceRate = 0;
    let revenue = 0;
    let conversions = 0;
    const channelMap = new Map<string, { sessions: number; revenue: number; conv: number }>();
    const deviceMap = new Map<string, number>();

    rows.forEach((row: any) => {
      const values = row.metricValues || [];
      const dims = row.dimensionValues || [];

      sessions += Number(values[0]?.value || 0);
      users += Number(values[1]?.value || 0);
      bounceRate += Number(values[2]?.value || 0);
      revenue += Number(values[3]?.value || 0);
      conversions += Number(values[4]?.value || 0);

      const sourceMedium = dims[0]?.value || 'Unknown';
      const device = dims[1]?.value || 'Unknown';

      if (sourceMedium) {
        const ch = channelMap.get(sourceMedium) || { sessions: 0, revenue: 0, conv: 0 };
        ch.sessions += Number(values[0]?.value || 0);
        ch.revenue += Number(values[3]?.value || 0);
        ch.conv += Number(values[4]?.value || 0);
        channelMap.set(sourceMedium, ch);
      }

      if (device) {
        deviceMap.set(device, (deviceMap.get(device) || 0) + Number(values[0]?.value || 0));
      }
    });

    // Top 5 channels by sessions
    const topChannels = Array.from(channelMap.entries())
      .map(([sourceMedium, { sessions, revenue, conv }]) => ({
        sourceMedium,
        sessions,
        revenue,
        conversionRate: sessions > 0 ? (conv / sessions) * 100 : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // Estimated CAC (very rough – improve later with real ad spend)
    const estimatedCac = users > 0 ? revenue / users : 0;

    return {
      sessions,
      users,
      bounceRate: rows.length > 0 ? bounceRate / rows.length : 0,
      topChannels,
      deviceBreakdown: Object.fromEntries(deviceMap),
      estimatedCac,
    };
  } catch (err) {
    console.error('[GA4 Fetch Error]', err);
    return null;
  }
}