// app/api/auth/hubspot/callback/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return new Response('<script>alert("HubSpot Auth Failed");window.close();</script>', { status: 400 });
  }

  const userId = parseInt(state);
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tokenResp = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: `${process.env.DOMAIN}/api/auth/hubspot/callback`,
      code,
    }),
  });

  if (!tokenResp.ok) {
    return new Response('HubSpot token exchange failed', { status: 400 });
  }

  const tokenData = await tokenResp.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  await run(
    'UPDATE users SET hubspot_connected = 1, hubspot_access_token = ?, hubspot_refresh_token = ? WHERE id = ?',
    [access_token, refresh_token, userId]
  );

  return new Response(
    '<script>alert("HubSpot Connected Successfully!"); window.close(); window.opener.location.reload();</script>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}