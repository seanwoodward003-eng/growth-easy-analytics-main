import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[APP/UNINSTALLED] Missing X-Shopify-Hmac-Sha256');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    console.error('[APP/UNINSTALLED] HMAC verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error('[APP/UNINSTALLED] JSON parse failed:', e);
    return NextResponse.json({ received: true });
  }

  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
  if (!shopDomain) {
    console.warn('[APP/UNINSTALLED] Missing shop domain header');
    return NextResponse.json({ received: true });
  }

  console.log('[APP/UNINSTALLED] Processing uninstall for shop:', shopDomain);

  try {
    await db
      .update(users)
      .set({
        shopify_shop: null,
        shopify_access_token: null,
      })
      .where(eq(users.shopifyShop, shopDomain));

    console.log('[APP/UNINSTALLED] Successfully cleared Shopify connection for shop:', shopDomain);
  } catch (err) {
    console.error('[APP/UNINSTALLED] Database update failed:', err);
  }

  return NextResponse.json({ success: true });
}