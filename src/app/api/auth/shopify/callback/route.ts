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

  params.delete('hmac');

  const paramObj: Record<string, string> = {};
  params.forEach((value, key) => {
    paramObj[key] = value;
  });

  const sortedKeys = Object.keys(paramObj).sort();
  const sortedMessageParts: string[] = [];
  for (const key of sortedKeys) {
    sortedMessageParts.push(`${key}=${paramObj[key]}`);
  }
  const message = sortedMessageParts.join('&');

  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(message)
    .digest('hex');

  console.log('[SHOPIFY-OAUTH] Sorted HMAC message:', message);
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
  // WEBHOOK REGISTRATION – ALL ORIGINAL DEBUG + MANDATORY COMPLIANCE
  // ────────────────────────────────────────────────────────────────
  console.log('[DEBUG-REG] Reached webhook registration block');
  console.log('[DEBUG-REG] Current access_token length:', access_token.length);
  console.log('[DEBUG-REG] Shop domain:', shop);
  console.log('[DEBUG-REG] NEXT_PUBLIC_APP_URL value:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET!!!');

  const apiVersion = '2026-01';
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json',
  };

  async function registerWebhook(topic: string, path: string) {
    const address = `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
    console.log(`[DEBUG-REG] Registering ${topic} at ${address}`);

    try {
      const checkRes = await fetch(`https://${shop}/admin/api/${apiVersion}/webhooks.json`, { headers });
      console.log('[DEBUG-REG] Check response status:', checkRes.status);
      if (!checkRes.ok) {
        const errText = await checkRes.text();
        console.error('[DEBUG-REG] Check failed:', checkRes.status, errText);
        return false;
      }
      const { webhooks } = await checkRes.json();
      const exists = webhooks?.some((w: any) => w.topic === topic && w.address === address);

      if (exists) {
        console.log(`[DEBUG-REG] ${topic} already exists — skipping`);
        return true;
      }
    } catch (checkErr) {
      console.error('[DEBUG-REG] Existence check threw:', checkErr);
    }

    try {
      const resp = await fetch(`https://${shop}/admin/api/${apiVersion}/webhooks.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          webhook: {
            topic,
            address,
            format: 'json',
          },
        }),
      });

      console.log('[DEBUG-REG] Webhook API response status:', resp.status);
      console.log('[DEBUG-REG] Response headers:', Object.fromEntries(resp.headers));

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`[SHOPIFY-OAUTH] Webhook registration FAILED for ${topic}: ${resp.status} - ${errText}`);
        console.error('[DEBUG-REG] Full Shopify error response body:', errText);
        return false;
      }

      const data = await resp.json();
      console.log(`[SHOPIFY-OAUTH] ${topic} webhook registered SUCCESSFULLY - ID: ${data.webhook?.id}`);
      return true;
    } catch (err) {
      console.error(`[DEBUG-REG] Registration exception for ${topic}:`, err);
      return false;
    }
  }

  console.log('[WEBHOOK-REG] Starting registrations...');
  await registerWebhook('orders/create', '/api/webhooks/shopify/orders');
  await registerWebhook('app/uninstalled', '/api/webhooks/shopify/app-uninstalled');
  // Mandatory compliance webhooks (fixes the 2 failed checks)
  await registerWebhook('customers/data_request', '/api/webhooks/shopify/customers-data-request');
  await registerWebhook('customers/redact', '/api/webhooks/shopify/customers-redact');
  await registerWebhook('shop/redact', '/api/webhooks/shopify/shop-redact');

  console.log('[SHOPIFY-OAUTH] Redirecting to dashboard with success param');
  return NextResponse.redirect(`${baseUrl}/dashboard?shopify_connected=true`);
}