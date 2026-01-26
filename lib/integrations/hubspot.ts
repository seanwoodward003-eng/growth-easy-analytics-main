// lib/integrations/hubspot.ts
import { run } from '@/lib/db';

export interface HubSpotData {
  atRiskContacts: number;
  openRate: number;
  clickRate: number;
  inactiveContacts: number;
  sampleContacts: Array<{ email: string; lastActivity: string; lastPurchase?: string }>;
}

export async function fetchHubSpotData(userId: number): Promise<HubSpotData | null> {
  try {
    // Get stored token – run returns any | null
    const rawResult = await run(
      'SELECT hubspot_access_token FROM users WHERE id = ?',
      [userId]
    );

    // Safe guard: check if result is null/undefined first
    if (rawResult == null) {  // == null catches both null and undefined
      console.log('[HubSpot] No user row found for ID', userId);
      return null;
    }

    // Now TS knows rawResult is not null/undefined – cast to expected shape
    const userRow = rawResult as {
      hubspot_access_token: string | null;
    };

    // Second check for required field
    if (!userRow.hubspot_access_token) {
      console.log('[HubSpot] Missing access token for user', userId);
      return null;
    }

    const accessToken = userRow.hubspot_access_token;

    // Get recent contacts (limit 100 for demo – increase later)
    const contactsResp = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=lastmodifieddate,createdate,lifecyclestage,email',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!contactsResp.ok) {
      console.error('[HubSpot] Contacts fetch failed:', await contactsResp.text());
      return null;
    }

    const { results } = await contactsResp.json();

    // Rough at-risk: no activity in last 60 days (simplified)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const inactive = results.filter((c: any) => {
      const lastMod = new Date(c.properties.lastmodifieddate);
      return lastMod < sixtyDaysAgo;
    });

    // Mock open/click rates (real HubSpot analytics API requires more setup)
    const openRate = 28; // Placeholder – replace with real /analytics/v3/... call later
    const clickRate = 4;

    // Sample 3 contacts for win-back personalization
    const sampleContacts = results
      .slice(0, 3)
      .map((c: any) => ({
        email: c.properties.email || 'unknown',
        lastActivity: c.properties.lastmodifieddate || 'unknown',
      }));

    return {
      atRiskContacts: inactive.length,
      openRate,
      clickRate,
      inactiveContacts: inactive.length,
      sampleContacts,
    };
  } catch (err) {
    console.error('[HubSpot Fetch Error]', err);
    return null;
  }
}