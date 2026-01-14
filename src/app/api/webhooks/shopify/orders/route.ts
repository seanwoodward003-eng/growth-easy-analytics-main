import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// ... your other imports

export const runtime = 'nodejs';  // Good, keep if needed

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[WEBHOOK] Missing X-Shopify-Hmac-Sha256');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody)  // ← raw string is fine (utf-8 default)
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(hmacHeader)
  );

  if (!isValid) console.error('[WEBHOOK] HMAC mismatch');
  return isValid;
}

export async function POST(request: NextRequest) {
  // Get raw body FIRST — this is key!
  const rawBody = await request.text();

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);  // Now safe to parse
  } catch (e) {
    console.error('[WEBHOOK] JSON parse error:', e);
    return NextResponse.json({ received: true });
  }

  // Use reliable header for shop domain (recommended!)
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
  if (!shopDomain) {
    console.warn('[WEBHOOK] Missing X-Shopify-Shop-Domain header');
    return NextResponse.json({ received: true });
  }

  // Now query user with shopDomain (instead of payload.shop_domain)
  const user = await db.query.users.findFirst({
    where: eq(users.shopifyShop, shopDomain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[WEBHOOK] No user for shop:', shopDomain);
    return NextResponse.json({ received: true });
  }

  // ... rest of your order processing logic (payload is now safe)

  return NextResponse.json({ success: true });
}