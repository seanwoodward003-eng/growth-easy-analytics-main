// app/api/auth/shopify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyHMAC(params: URLSearchParams) {
  const hmac = params.get('hmac');
  if (!hmac) {
    console.log('HMAC missing');
    return false;
  }
  const message = Array.from(params.entries())
    .filter(([k]) => !['hmac', 'signature'].includes(k))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  console.log('HMAC message:', message);
  const digest = crypto.createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!).update(message).digest('hex');
  console.log('Computed digest:', digest);
  console.log('Shopify hmac:', hmac);
  const isValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  console.log('HMAC valid:', isValid);
  return isValid;
}

export async function GET(request: NextRequest) {
  console.log('Shopify callback hit');

  const params = request.nextUrl.searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!verifyHMAC(params)) {
    console.log('HMAC verification failed');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_signature`);
  }

  const code = params.get('code');
  const state = params.get('state');
  console.log('Code:', code);
  console.log('State:', state);

  if (!code || !state) {
    console.log('Missing code or state');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=auth_failed`);
  }

  const [userIdStr, shop] = state.split('|');
  const userId = parseInt(userIdStr);
  console.log('Parsed userId:', userId, 'Shop:', shop);

  if (isNaN(userId)) {
    console.log('Invalid userId');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`);
  }

  const user = await getCurrentUser();
  console.log('Current user:', user ? user.id : 'null');

  if (!user || user.id !== userId) {
    console.log('User mismatch or not found');
    return NextResponse.redirect(`${baseUrl}/login?error=session_lost`);
  }

  console.log('Fetching token from Shopify');

  const tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResp.ok) {
    const errorText = await tokenResp.text();
    console.log('Token exchange failed:', tokenResp.status, errorText);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=token_failed`);
  }

  const { access_token } = await tokenResp.json();
  console.log('Token received:', access_token.substring(0, 10) + '...');

  console.log('Updating DB');

  try {
    await run(
      'UPDATE users SET shopify_shop = ?, shopify_access_token = ? WHERE id = ?',
      [shop, access_token, userId]
    );
    console.log('DB update success');
  } catch (dbError) {
    console.error('DB update failed:', dbError);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=db_update_failed`);
  }

  console.log('Redirecting to success');

  return NextResponse.redirect(`${baseUrl}/dashboard?shopify_connected=true`);
}