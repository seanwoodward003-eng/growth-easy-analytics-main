import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[CUSTOMERS-DATA-REQUEST] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) {
    console.error('[CUSTOMERS-DATA-REQUEST] SHOPIFY_CLIENT_SECRET is not set');
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
    console.error('[CUSTOMERS-DATA-REQUEST] HMAC mismatch');
    console.error('Calculated HMAC:', calculated);
    console.error('Received HMAC:  ', hmacHeader);
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  const topic = request.headers.get('X-Shopify-Topic') || 'customers/data_request';
  const shop = request.headers.get('X-Shopify-Shop-Domain') || 'unknown';

  console.log(`[CUSTOMERS-DATA-REQUEST] Incoming webhook from ${shop} at ${new Date().toISOString()}`);

  const rawBody = await request.text();

  console.log(`[CUSTOMERS-DATA-REQUEST] Raw body length: ${rawBody.length}`);
  if (rawBody.length > 0 && rawBody.length < 10000) {
    console.log(`[CUSTOMERS-DATA-REQUEST] Raw body preview:`, rawBody.substring(0, 500));
  }

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('[CUSTOMERS-DATA-REQUEST] HMAC verified successfully');

  let payload;
  try {
    payload = JSON.parse(rawBody);
    console.log('[CUSTOMERS-DATA-REQUEST] Valid payload:', {
      topic: payload.topic,
      shop_domain: payload.shop_domain,
      customer: payload.customer ? { id: payload.customer.id } : null,
    });
  } catch (err) {
    console.error('[CUSTOMERS-DATA-REQUEST] JSON parse error:', err);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // TODO: Implement actual GDPR data request logic here
  // e.g. queue job to export customer data, email admin, etc.

  console.log('[CUSTOMERS-DATA-REQUEST] Webhook processed');
  return NextResponse.json({ received: true }, { status: 200 });
}