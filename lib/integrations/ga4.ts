// lib/integrations/ga4.ts
import { run } from '@/lib/db';

export interface GA4Data {
  sessions: number;
  users: number;
  bounceRate: number; // 0-1 scale
  bounceRatePercent: string; // formatted % 
  topChannels: Array<{
    sourceMedium: string;
    sessions: number;
    revenue: number;
    conversionRate: number;
    conversions: number;
  }>;
  deviceBreakdown: { [device: string]: number };
  estimatedCac: number;
  adSpend?: number; // if available
  error?: string;
}

interface GA4ReportRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

export async function fetchGA4Data(
  userId: number,
  options: { dateRange?: '7days' | '30days' | '90days' } = { dateRange: '30days' }
): Promise<GA4Data> {
  try {
    const rawResult = await run(
      'SELECT ga4_access_token, ga4_refresh_token, ga4_property_id FROM users WHERE id = ?',
      [userId]
    );

    if (!rawResult || !Array.isArray(rawResult) || rawResult.length === 0) {
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0, error: 'No user data' };
    }

    const userRow = rawResult[0] as {
      ga4_access_token: string | null;
      ga4_refresh_token: string | null;
      ga4_property_id: string | null;
    };

    if (!userRow.ga4_property_id || !userRow.ga4_access_token) {
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0, error: 'Missing property ID or token' };
    }

    let accessToken = userRow.ga4_access_token;

    // Determine date range
    const dateRangeMap = {
      '7days': { start: '7daysAgo', end: 'today' },
      '30days': { start: '30daysAgo', end: 'today' },
      '90days': { start: '90daysAgo', end: 'today' },
    };
    const range = dateRangeMap[options.dateRange || '30days'];

    // Main report
    const reportResp = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${userRow.ga4_property_id}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: range.start, endDate: range.end }],
          metrics: [
            { name: 'sessions' },
            { name: 'users' },
            { name: 'bounceRate' },
            { name: 'ecommerceRevenue' },
            { name: 'conversions' },
            { name: 'totalRevenue' },
            { name: 'advertiserAdCost' }, // ad spend if linked
          ],
          dimensions: [
            { name: 'sourceMedium' },
            { name: 'deviceCategory' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 100, // top 100 channels max
        }),
      }
    );

    if (reportResp.status === 401) {
      console.warn('[GA4] Token expired for user', userId);
      // TODO: refresh token using ga4_refresh_token + Google OAuth
      // For now, return partial
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0, error: 'Token expired' };
    }

    if (!reportResp.ok) {
      const errText = await reportResp.text();
      console.error('[GA4] Report failed:', errText);
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0, error: `API error: ${errText.slice(0, 200)}` };
    }

    const data = await reportResp.json();
    const rows = (data.rows || []) as GA4ReportRow[];

    let sessions = 0;
    let users = 0;
    let bounceRateSum = 0;
    let revenue = 0;
    let adSpend = 0;
    let conversions = 0;

    const channelMap = new Map<string, { sessions: number; revenue: number; conv: number }>();
    const deviceMap = new Map<string, number>();

    rows.forEach(row => {
      const metrics = row.metricValues || [];
      const dims = row.dimensionValues || [];

      const rowSessions = safeNum(metrics[0]?.value);
      const rowUsers = safeNum(metrics[1]?.value);
      const rowBounce = safeNum(metrics[2]?.value);
      const rowRevenue = safeNum(metrics[3]?.value);
      const rowConversions = safeNum(metrics[4]?.value);
      const rowAdSpend = safeNum(metrics[5]?.value); // advertiserAdCost

      sessions += rowSessions;
      users += rowUsers;
      bounceRateSum += rowBounce * rowSessions; // weighted average
      revenue += rowRevenue;
      conversions += rowConversions;
      adSpend += rowAdSpend;

      const sourceMedium = dims[0]?.value || 'Unknown';
      const device = dims[1]?.value || 'Unknown';

      if (sourceMedium !== '(not set)' && sourceMedium !== '(direct)') {
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
        conversions: conv,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const estimatedCac = users > 0 ? Math.round((adSpend || revenue * 0.15) / users * 100) / 100 : 0; // fallback 15% of revenue

    return {
      sessions,
      users,
      bounceRate: weightedBounceRate,
      bounceRatePercent: `${(weightedBounceRate * 100).toFixed(1)}%`,
      topChannels,
      deviceBreakdown: Object.fromEntries(deviceMap),
      estimatedCac,
      adSpend: adSpend || undefined,
    };
  } catch (err: any) {
    console.error('[GA4 Fetch Error]', err?.message || err);
    return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0, error: err?.message || 'Unknown error' };
  }
}