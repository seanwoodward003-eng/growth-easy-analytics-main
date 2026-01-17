import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[CUSTOMERS-REDACT] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody, 'utf8')
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(hmacHeader)
  );

  if (!isValid) {
    console.error('[CUSTOMERS-REDACT] HMAC mismatch');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  console.log('[CUSTOMERS-REDACT] Incoming POST request');
  console.log('[DEBUG] Headers:', Object.fromEntries(request.headers));

  const rawBody = await request.text();
  console.log('[DEBUG] Raw body length:', rawBody.length);
  console.log('[DEBUG] Raw body (first 500 chars):', rawBody.substring(0, 500));

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
  console.log('[DEBUG] HMAC header present:', !!hmac);

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    console.error('[CUSTOMERS-REDACT] HMAC verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('[CUSTOMERS-REDACT] HMAC verified successfully');

  let payload;
  try {
    payload = JSON.parse(rawBody);
    console.log('[DEBUG] Payload parsed:', JSON.stringify(payload, null, 2));
  } catch (e) {
    console.error('[CUSTOMERS-REDACT] JSON parse error:', e);
  }

  console.log('[CUSTOMERS-REDACT] Webhook received and verified');
  console.log('[DEBUG] Returning 200 OK');

  return NextResponse.json({ received: true });
}