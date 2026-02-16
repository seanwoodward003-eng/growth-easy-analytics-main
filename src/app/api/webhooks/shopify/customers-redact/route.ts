import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[CUSTOMERS-REDACT] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[CUSTOMERS-REDACT] SHOPIFY_WEBHOOK_SECRET is not set');
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
    console.error('[CUSTOMERS-REDACT] HMAC mismatch');
    console.error('Calculated:', calculated);
    console.error('Received:   ', hmacHeader);
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  const topic = request.headers.get('X-Shopify-Topic') || 'customers/redact';
  const shop = request.headers.get('X-Shopify-Shop-Domain') || 'unknown-shop';

  console.log(`[CUSTOMERS-REDACT] Incoming webhook from ${shop} at ${new Date().toISOString()}`);

  const rawBody = await request.text();

  console.log(`[CUSTOMERS-REDACT] Raw body length: ${rawBody.length} bytes`);

  if (rawBody.length > 0 && rawBody.length < 10000) {
    console.log(`[CUSTOMERS-REDACT] Raw body preview:`, rawBody.substring(0, 500));
  }

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('[CUSTOMERS-REDACT] HMAC verified successfully');

  let payload;
  try {
    payload = JSON.parse(rawBody);
    console.log('[CUSTOMERS-REDACT] Parsed payload keys:', Object.keys(payload));
  } catch (err) {
    console.error('[CUSTOMERS-REDACT] JSON parse error:', err);
    return NextResponse.json({ received: true, note: 'Invalid JSON but accepted' }, { status: 200 });
  }

  // TODO: Implement actual customer data redaction/deletion logic here
  // e.g. find and remove all data for this customer across your DB

  console.log('[CUSTOMERS-REDACT] Processing complete');
  return NextResponse.json({ received: true }, { status: 200 });
}