import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyHMAC(params: URLSearchParams): boolean {
  const hmac = params.get('hmac');
  if (!hmac) {
    console.log('[SHOPIFY-OAUTH] HMAC missing');
    return false;
  }

  // Modern/correct way: use the full query string excluding hmac param
  params.delete('hmac');
  const message = params.toString(); // preserves original order & encoding

  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(message)
    .digest('hex'); // hex for OAuth callback

  console.log('[SHOPIFY-OAUTH] HMAC message:', message);
  console.log('[SHOPIFY-OAUTH] Computed digest:', digest);
  console.log('[SHOPIFY-OAUTH] Shopify provided hmac:', hmac);

  const isValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  console.log('[SHOPIFY-OAUTH] HMAC valid:', isValid);
  return isValid;
}

export async function GET(request: NextRequest) {
  console.log('[SHOPIFY-OAUTH] Callback endpoint hit at', new Date().toISOString());

  const params = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!verifyHMAC(params)) {
    console.log('[SHOPIFY-OAUTH] HMAC verification FAILED');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_signature`);
  }

  const code = params.get('code');
  const state = params.get('state');
  console.log('[SHOPIFY-OAUTH] code:', code);
  console.log('[SHOPIFY-OAUTH] state:', state);

  if (!code || !state) {
    console.log('[SHOPIFY-OAUTH] Missing code or state');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=auth_failed`);
  }

  const [userIdStr, shop] = state.split('|');
  const userId = parseInt(userIdStr);
  console.log('[SHOPIFY-OAUTH] Parsed userId:', userId, 'Shop domain:', shop);

  if (isNaN(userId)) {
    console.log('[SHOPIFY-OAUTH] Invalid userId from state');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`);
  }

  const user = await getCurrentUser();
  console.log('[SHOPIFY-OAUTH] getCurrentUser() returned user id:', user ? user.id : 'null');

  if (!user || user.id !== userId) {
    console.log('[SHOPIFY-OAUTH] User mismatch or not found — expected:', userId);
    return NextResponse.redirect(`${baseUrl}/login?error=session_lost`);
  }

  console.log('[SHOPIFY-OAUTH] Fetching access token from Shopify...');

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
    console.log('[SHOPIFY-OAUTH] Token exchange FAILED:', tokenResp.status, errorText);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=token_failed`);
  }

  const { access_token } = await tokenResp.json();
  console.log('[SHOPIFY-OAUTH] Access token received (first 10 chars):', access_token.substring(0, 10) + '...');

  console.log('[SHOPIFY-OAUTH] Updating user in DB — shop:', shop, 'userId:', userId);

  try {
    await run(
      'UPDATE users SET shopify_shop = ?, shopify_access_token = ? WHERE id = ?',
      [shop, access_token, userId]
    );
    console.log('[SHOPIFY-OAUTH] DB update SUCCESS');
  } catch (dbError) {
    console.error('[SHOPIFY-OAUTH] DB update FAILED:', dbError);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=db_update_failed`);
  }

  // ────────────────────────────────────────────────────────────────
  // NEW: Register the orders/create webhook automatically
  // ────────────────────────────────────────────────────────────────
  console.log('[SHOPIFY-OAUTH] Registering webhook for orders/create...');

  const webhookAddress = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/orders`;

  const webhookResp = await fetch(`https://${shop}/admin/api/2026-01/webhooks.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhook: {
        topic: 'orders/create',
        address: webhookAddress,
        format: 'json',
      },
    }),
  });

  if (!webhookResp.ok) {
    const errText = await webhookResp.text();
    console.error(
      '[SHOPIFY-OAUTH] Webhook registration FAILED:',
      webhookResp.status,
      errText
    );
    // Note: We still proceed with redirect — failure here shouldn't block install
  } else {
    console.log('[SHOPIFY-OAUTH] Webhook registered SUCCESSFULLY');
  }

  console.log('[SHOPIFY-OAUTH] Redirecting to dashboard with success param');
  return NextResponse.redirect(`${baseUrl}/dashboard?shopify_connected=true`);
}