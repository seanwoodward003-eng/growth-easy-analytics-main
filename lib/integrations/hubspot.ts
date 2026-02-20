// lib/integrations/hubspot.ts
import { run } from '@/lib/db';

export interface HubSpotData {
  atRiskContacts: number;
  openRate: number;
  clickRate: number;
  inactiveContacts: number;
  sampleContacts: Array<{ email: string; lastActivity: string; lastPurchase?: string }>;
  totalContacts: number;
  error?: string;
}

export async function fetchHubSpotData(userId: number): Promise<HubSpotData> {
  try {
    const rawResult = await run(
      'SELECT hubspot_access_token FROM users WHERE id = ?',
      [userId]
    );

    if (!rawResult || !Array.isArray(rawResult) || rawResult.length === 0) {
      return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0, error: 'No user data' };
    }

    const userRow = rawResult[0] as { hubspot_access_token: string | null };

    if (!userRow.hubspot_access_token) {
      return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0, error: 'Missing access token' };
    }

    const accessToken = userRow.hubspot_access_token;

    // Get recent contacts (increase limit when needed)
    const contactsResp = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=lastmodifieddate,createdate,lifecyclestage,email,hs_lastactivitydate',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!contactsResp.ok) {
      const errText = await contactsResp.text();
      console.error('[HubSpot] Contacts fetch failed:', errText);
      return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0, error: errText.slice(0, 200) };
    }

    const { results, total } = await contactsResp.json();

    // At-risk / inactive: no activity in last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const inactive = results.filter((c: any) => {
      const lastActivity = c.properties.hs_lastactivitydate || c.properties.lastmodifieddate;
      return lastActivity && new Date(lastActivity) < sixtyDaysAgo;
    });

    // Sample contacts
    const sampleContacts = results
      .slice(0, 5)
      .map((c: any) => ({
        email: c.properties.email || 'unknown',
        lastActivity: c.properties.hs_lastactivitydate || c.properties.lastmodifieddate || 'unknown',
      }));

    // Email stats — HubSpot Marketing API (requires scope & setup)
    // For now placeholder — real call example below (uncomment when ready)
    let openRate = 28;
    let clickRate = 4;

    /*
    // Real call example (add marketing scope to OAuth)
    const analyticsResp = await fetch(
      'https://api.hubapi.com/analytics/v3/performance/email?limit=10',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (analyticsResp.ok) {
      const stats = await analyticsResp.json();
      openRate = stats.overall?.openRate || 28;
      clickRate = stats.overall?.clickRate || 4;
    }
    */

    return {
      atRiskContacts: inactive.length,
      openRate,
      clickRate,
      inactiveContacts: inactive.length,
      sampleContacts,
      totalContacts: total || results.length,
    };
  } catch (err: any) {
    console.error('[HubSpot Fetch Error]', err?.message || err);
    return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0, error: err?.message || 'Unknown error' };
  }
}