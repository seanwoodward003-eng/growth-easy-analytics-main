import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyHMAC(params: URLSearchParams) {
  const hmac = params.get('hmac');
  if (!hmac) return false;

  const message = Array.from(params.entries())
    .filter(([k]) => !['hmac', 'signature'].includes(k))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const digest = crypto.createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function GET(request: NextRequest) {
  console.log('[SHOPIFY-OAUTH] Callback hit at', new Date().toISOString());

  const params = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!verifyHMAC(params)) {
    console.log('[SHOPIFY-OAUTH] HMAC FAILED');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_signature`);
  }

  const code = params.get('code');
  const state = params.get('state');

  if (!code || !state) {
    console.log('[SHOPIFY-OAUTH] Missing code/state');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=auth_failed`);
  }

  const [userIdStr, shop] = state.split('|');
  const userId = parseInt(userIdStr);

  if (isNaN(userId)) {
    console.log('[SHOPIFY-OAUTH] Invalid userId');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`);
  }

  const user = await getCurrentUser();

  if (!user || user.id !== userId) {
    console.log('[SHOPIFY-OAUTH] User mismatch');
    return NextResponse.redirect(`${baseUrl}/login?error=session_lost`);
  }

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
    const error = await tokenResp.text();
    console.log('[SHOPIFY-OAUTH] Token exchange failed:', error);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=token_failed`);
  }

  const { access_token } = await tokenResp.json();

  try {
    await run(
      'UPDATE users SET shopify_shop = ?, shopify_access_token = ? WHERE id = ?',
      [shop, access_token, userId]
    );
    console.log('[SHOPIFY-OAUTH] DB updated');
  } catch (dbError) {
    console.error('[SHOPIFY-OAUTH] DB update failed:', dbError);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=db_update_failed`);
  }

  // AUTO-REGISTER WEBHOOK — THIS IS THE MISSING PIECE
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/orders`;

  const webhookRes = await fetch(`https://${shop}/admin/api/2025-01/webhooks.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhook: {
        topic: 'orders/create',
        address: webhookUrl,
        format: 'json',
      },
    }),
  });

  if (webhookRes.ok) {
    console.log('[OAUTH] Webhook auto-registered for', shop);
  } else {
    console.error('[OAUTH] Webhook registration failed:', await webhookRes.text());
  }

  return NextResponse.redirect(`${baseUrl}/dashboard?shopify_connected=true`);
}