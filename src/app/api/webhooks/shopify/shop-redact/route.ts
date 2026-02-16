import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[SHOP-REDACT] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[SHOP-REDACT] SHOPIFY_WEBHOOK_SECRET is not set in environment');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(hmacHeader)
  );

  if (!isValid) {
    console.error('[SHOP-REDACT] HMAC mismatch');
    console.error('Calculated HMAC:', calculated);
    console.error('Received HMAC:   ', hmacHeader);
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  const topic = request.headers.get('X-Shopify-Topic') || 'shop/redact';
  const shop = request.headers.get('X-Shopify-Shop-Domain') || 'unknown-shop';

  console.log(`[SHOP-REDACT] Incoming webhook from shop: ${shop} at ${new Date().toISOString()}`);

  const rawBody = await request.text();

  console.log(`[SHOP-REDACT] Raw body length: ${rawBody.length} bytes`);

  if (rawBody.length > 0 && rawBody.length < 10000) {
    console.log(`[SHOP-REDACT] Raw body preview:`, rawBody.substring(0, 500));
  }

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('[SHOP-REDACT] HMAC verified successfully');

  let payload;
  try {
    payload = JSON.parse(rawBody);
    console.log('[SHOP-REDACT] Parsed payload keys:', Object.keys(payload));
  } catch (err) {
    console.error('[SHOP-REDACT] JSON parse error:', err);
    // Still return 200 – Shopify retries on non-2xx
    return NextResponse.json({ received: true, note: 'Invalid JSON but accepted' }, { status: 200 });
  }

  // TODO: Implement actual shop-level data redaction logic here
  // e.g. delete all data associated with this shop, queue permanent removal, etc.
  console.log('[SHOP-REDACT] Processing complete for shop:', shop);

  return NextResponse.json({ received: true }, { status: 200 });
}