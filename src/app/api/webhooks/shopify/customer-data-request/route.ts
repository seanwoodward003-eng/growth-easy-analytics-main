import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[CUSTOMERS-DATA-REQUEST] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[CUSTOMERS-DATA-REQUEST] SHOPIFY_WEBHOOK_SECRET is not set');
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
    console.error('Calculated:', calculated);
    console.error('Received:   ', hmacHeader);
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  const topic = request.headers.get('X-Shopify-Topic') || 'customers/data_request';
  const shop = request.headers.get('X-Shopify-Shop-Domain') || 'unknown-shop';

  console.log(`[CUSTOMERS-DATA-REQUEST] Incoming webhook from ${shop} at ${new Date().toISOString()}`);

  const rawBody = await request.text();

  console.log(`[CUSTOMERS-DATA-REQUEST] Raw body length: ${rawBody.length} bytes`);

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
    console.log('[CUSTOMERS-DATA-REQUEST] Parsed payload keys:', Object.keys(payload));
  } catch (err) {
    console.error('[CUSTOMERS-DATA-REQUEST] JSON parse error:', err);
    return NextResponse.json({ received: true, note: 'Invalid JSON but accepted' }, { status: 200 });
  }

  // TODO: Implement GDPR data export / customer access request logic here
  // e.g. collect all customer data, email admin or provide download link

  console.log('[CUSTOMERS-DATA-REQUEST] Processing complete');
  return NextResponse.json({ received: true }, { status: 200 });
}