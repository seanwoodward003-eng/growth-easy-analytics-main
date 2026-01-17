import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[SHOP-REDACT] Missing X-Shopify-Hmac-Sha256 header');
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
    console.error('[SHOP-REDACT] HMAC comparison failed (timing-safe)');
    return false;
  }
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error('[SHOP-REDACT] Failed to read body', err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Process payload ────────────────────────────────────────
  try {
    const payload = JSON.parse(rawBody);

    console.log('[SHOP-REDACT] VERIFIED & RECEIVED', {
      shop_domain: payload.domain,
      shop_id: payload.shop_id,
      occurred_at: payload.occurred_at,
    });

    // Future: delete ALL data related to this shop
    // await deleteShopData(payload.shop_id);
  } catch (parseErr) {
    console.error('[SHOP-REDACT] Payload parse failed:', parseErr);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}