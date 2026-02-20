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
    // Type assertion to narrow return type
    const rawResult = await run(
      'SELECT ga4_access_token, ga4_refresh_token, ga4_property_id FROM users WHERE id = ?',
      [userId]
    ) as Array<{
      ga4_access_token: string | null;
      ga4_refresh_token: string | null;
      ga4_property_id: string | null;
    }> | null;

    if (!rawResult || rawResult.length === 0) {
      console.log('[GA4] No user row found for ID', userId);
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0 };
    }

    const userRow = rawResult[0];

    if (!userRow.ga4_property_id || !userRow.ga4_access_token) {
      console.log('[GA4] Missing property ID or access token for user', userId);
      return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0 };
    }

    const accessToken = userRow.ga4_access_token;
    const propertyId = userRow.ga4_property_id;

    // ... rest of your original code remains unchanged ...
    // (the fetch calls, parsing, etc.)

    // Return your parsed data
    // ... your existing parsing logic ...

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
    return { sessions: 0, users: 0, bounceRate: 0, bounceRatePercent: '0%', topChannels: [], deviceBreakdown: {}, estimatedCac: 0 };
  }
}