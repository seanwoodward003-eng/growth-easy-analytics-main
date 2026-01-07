// app/api/auth/ga4/callback/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return new Response('<script>alert("GA4 Auth Failed");window.close();</script>', { status: 400 });
  }

  const userId = parseInt(state);
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/ga4/callback`;

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResp.ok) {
    const error = await tokenResp.text();
    console.error('Token exchange failed:', error);
    return new Response('<script>alert("Failed to get GA4 token");window.close();</script>', { status: 400 });
  }

  const tokenData = await tokenResp.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  let property_id: string | null = null;

  try {
    // Correct endpoint: v1beta + :list method
    const summariesResp = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries:list',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (summariesResp.ok) {
      const data = await summariesResp.json();
      const summaries = data.accountSummaries || [];
      if (summaries.length > 0) {
        // Take the first property from the first account
        const firstProperty = summaries[0].propertySummaries?.[0];
        if (firstProperty?.property) {
          property_id = firstProperty.property.split('/').pop(); // e.g., "properties/123456789"
        }
      }
    } else {
      console.warn('Failed to fetch account summaries:', summariesResp.status);
    }
  } catch (e) {
    console.warn('GA4 property detection failed:', e);
  }

  // Save to DB
  await run(
    `UPDATE users SET 
      ga4_connected = 1,
      ga4_access_token = ?,
      ga4_refresh_token = ?,
      ga4_property_id = COALESCE(?, ga4_property_id),
      ga4_last_refreshed = datetime('now')
     WHERE id = ?`,
    [access_token, refresh_token || null, property_id, userId]
  );

  return new Response(
    '<script>alert("GA4 Connected Successfully!" + (property_id ? " Property ID: ' + property_id + '"' : '')); window.close(); window.opener?.location.reload();</script>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}