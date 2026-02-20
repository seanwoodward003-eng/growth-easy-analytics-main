// lib/integrations/ga4.ts
import { run } from '@/lib/db';

export interface GA4Data {
  sessions: number;
  users: number;
  bounceRate: number;
  bounceRatePercent: string;
  topChannels: Array<{
    sourceMedium: string;
    sessions: number;
    revenue: number;
    conversionRate: number;
  }>;
  deviceBreakdown: { [device: string]: number };
  estimatedCac: number;
  error?: string;
}

export async function fetchGA4Data(userId: number): Promise<GA4Data> {
  try {
    const rawResult = await run(
      'SELECT ga4_access_token, ga4_refresh_token, ga4_property_id FROM users WHERE id = ?',
      [userId]
    );

    // Safe check without assuming type – prevents truthiness error
    if (!rawResult || typeof rawResult !== 'object' || rawResult === null || !Array.isArray(rawResult) || rawResult.length === 0) {
      console.log('[GA4] No user row found for ID', userId);
      return {
        sessions: 0,
        users: 0,
        bounceRate: 0,
        bounceRatePercent: '0%',
        topChannels: [],
        deviceBreakdown: {},
        estimatedCac: 0,
      };
    }

    // Now safe to access first row
    const userRow = rawResult[0] as {
      ga4_access_token: string | null;
      ga4_refresh_token: string | null;
      ga4_property_id: string | null;
    };

    if (!userRow.ga4_property_id || !userRow.ga4_access_token) {
      console.log('[GA4] Missing property ID or access token for user', userId);
      return {
        sessions: 0,
        users: 0,
        bounceRate: 0,
        bounceRatePercent: '0%',
        topChannels: [],
        deviceBreakdown: {},
        estimatedCac: 0,
      };
    }

    const accessToken = userRow.ga4_access_token;
    const propertyId = userRow.ga4_property_id;

    // Simple token check (expand with refresh later)
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
      return {
        sessions: 0,
        users: 0,
        bounceRate: 0,
        bounceRatePercent: '0%',
        topChannels: [],
        deviceBreakdown: {},
        estimatedCac: 0,
        error: 'Token expired',
      };
    }

    if (!testResp.ok) {
      console.error('[GA4] API test failed:', await testResp.text());
      return {
        sessions: 0,
        users: 0,
        bounceRate: 0,
        bounceRatePercent: '0%',
        topChannels: [],
        deviceBreakdown: {},
        estimatedCac: 0,
      };
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
      return {
        sessions: 0,
        users: 0,
        bounceRate: 0,
        bounceRatePercent: '0%',
        topChannels: [],
        deviceBreakdown: {},
        estimatedCac: 0,
      };
    }

    const data = await report.json();
    const rows = data.rows || [];

    let sessions = 0;
    let users = 0;
    let bounceRateSum = 0;
    let revenue = 0;
    let conversions = 0;

    const channelMap = new Map<string, { sessions: number; revenue: number; conv: number }>();
    const deviceMap = new Map<string, number>();

    rows.forEach((row: any) => {
      const values = row.metricValues || [];
      const dims = row.dimensionValues || [];

      const rowSessions = Number(values[0]?.value || 0);
      const rowUsers = Number(values[1]?.value || 0);
      const rowBounce = Number(values[2]?.value || 0);
      const rowRevenue = Number(values[3]?.value || 0);
      const rowConversions = Number(values[4]?.value || 0);

      sessions += rowSessions;
      users += rowUsers;
      bounceRateSum += rowBounce * rowSessions; // weighted
      revenue += rowRevenue;
      conversions += rowConversions;

      const sourceMedium = dims[0]?.value || 'Unknown';
      const device = dims[1]?.value || 'Unknown';

      if (sourceMedium && sourceMedium !== '(not set)') {
        const ch = channelMap.get(sourceMedium) || { sessions: 0, revenue: 0, conv: 0 };
        ch.sessions += rowSessions;
        ch.revenue += rowRevenue;
        ch.conv += rowConversions;
        channelMap.set(sourceMedium, ch);
      }

      deviceMap.set(device, (deviceMap.get(device) || 0) + rowSessions);
    });

    const weightedBounceRate = sessions > 0 ? bounceRateSum / sessions : 0;

    const topChannels = Array.from(channelMap.entries())
      .map(([sourceMedium, { sessions, revenue, conv }]) => ({
        sourceMedium,
        sessions,
        revenue: Math.round(revenue * 100) / 100,
        conversionRate: sessions > 0 ? (conv / sessions) * 100 : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    const estimatedCac = users > 0 ? Math.round(revenue / users * 100) / 100 : 0;

    return {
      sessions,
      users,
      bounceRate: weightedBounceRate,
      bounceRatePercent: `${(weightedBounceRate * 100).toFixed(1)}%`,
      topChannels,
      deviceBreakdown: Object.fromEntries(deviceMap),
      estimatedCac,
    };
  } catch (err) {
    console.error('[GA4 Fetch Error]', err);
    return {
      sessions: 0,
      users: 0,
      bounceRate: 0,
      bounceRatePercent: '0%',
      topChannels: [],
      deviceBreakdown: {},
      estimatedCac: 0,
      error: String(err),
    };
  }
}