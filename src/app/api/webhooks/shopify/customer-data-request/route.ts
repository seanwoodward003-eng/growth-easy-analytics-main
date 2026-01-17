import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[CUSTOMERS-DATA-REQUEST] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody, 'utf8')
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculated),
      Buffer.from(hmacHeader)
    );
  } catch {
    console.error('[CUSTOMERS-DATA-REQUEST] HMAC comparison failed (timing-safe)');
    return false;
  }
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error('[CUSTOMERS-DATA-REQUEST] Failed to read body', err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Process payload ────────────────────────────────────────
  try {
    const payload = JSON.parse(rawBody);

    console.log('[CUSTOMERS-DATA-REQUEST] VERIFIED & RECEIVED', {
      shop_domain: payload.domain,
      shop_id: payload.shop_id,
      customer: payload.customer?.id,
      customer_email: payload.customer?.email,
      data_request_id: payload.data_request?.id,
      requested_at: payload.data_request?.requested_at,
    });

    // Future: collect data and send to merchant (very rare request)
    // await sendDataRequestEmail(payload);
  } catch (parseErr) {
    console.error('[CUSTOMERS-DATA-REQUEST] Payload parse failed:', parseErr);
  }

  // Always return 200 quickly - Shopify requires fast response
  return NextResponse.json({ received: true }, { status: 200 });
}