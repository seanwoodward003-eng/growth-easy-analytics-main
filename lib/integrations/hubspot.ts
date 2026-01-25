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
    const user = await run(
      'SELECT hubspot_access_token FROM users WHERE id = ?',
      [userId]
    );

    if (!user || !user.hubspot_access_token) return null;

    const accessToken = user.hubspot_access_token;

    // Get recent contacts with last activity
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
    const openRate = 28; // Placeholder – replace with real /analytics/v3/... call
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