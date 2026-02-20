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

    // Safe, TS-friendly check
    let resultArray: unknown[] = [];
    if (Array.isArray(rawResult)) {
      resultArray = rawResult;
    }

    if (resultArray.length === 0) {
      console.log('[HubSpot] No user row found for ID', userId);
      return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0 };
    }

    const userRow = resultArray[0] as { hubspot_access_token: string | null };

    if (!userRow.hubspot_access_token) {
      console.log('[HubSpot] Missing access token for user', userId);
      return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0 };
    }

    const accessToken = userRow.hubspot_access_token;

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

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const inactive = results.filter((c: any) => {
      const lastActivity = c.properties.hs_lastactivitydate || c.properties.lastmodifieddate;
      return lastActivity && new Date(lastActivity) < sixtyDaysAgo;
    });

    const sampleContacts = results
      .slice(0, 5)
      .map((c: any) => ({
        email: c.properties.email || 'unknown',
        lastActivity: c.properties.hs_lastactivitydate || c.properties.lastmodifieddate || 'unknown',
      }));

    let openRate = 28;
    let clickRate = 4;

    return {
      atRiskContacts: inactive.length,
      openRate,
      clickRate,
      inactiveContacts: inactive.length,
      sampleContacts,
      totalContacts: total || results.length,
    };
  } catch (err) {
    console.error('[HubSpot Fetch Error]', err);
    return { atRiskContacts: 0, openRate: 0, clickRate: 0, inactiveContacts: 0, sampleContacts: [], totalContacts: 0, error: String(err) };
  }
}