// app/api/webhooks/shopify/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, users } from '@/lib/db';  // ← Import db AND users table from your lib/db.ts
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[WEBHOOK] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody, 'utf8')  // Explicit utf8 for consistency
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(hmacHeader)
  );

  if (!isValid) {
    console.error('[WEBHOOK] HMAC mismatch');
    console.error('[WEBHOOK] Received HMAC (first 20):', hmacHeader.substring(0, 20) + '...');
    console.error('[WEBHOOK] Calculated (first 20):', calculated.substring(0, 20) + '...');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  // 1. Get raw body FIRST (critical for correct HMAC)
  const rawBody = await request.text();

  // 2. Get HMAC header
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  // 3. Verify signature
  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. Parse payload safely
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error('[WEBHOOK] JSON parse error:', e instanceof Error ? e.message : String(e));
    return NextResponse.json({ received: true });
  }

  // 5. Get shop domain from Shopify header (most reliable method)
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
  if (!shopDomain) {
    console.warn('[WEBHOOK] Missing X-Shopify-Shop-Domain header');
    return NextResponse.json({ received: true });
  }

  // 6. Find the user connected to this shop
  const user = await db.query.users.findFirst({
    where: eq(users.shopifyShop, shopDomain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[WEBHOOK] No user found for shop:', shopDomain);
    return NextResponse.json({ received: true });
  }

  const userId = user.id;

  // 7. Extract order data from payload
  const order = payload;

  if (
    !order?.id ||
    !order.total_price_set?.shop_money?.amount ||
    !order.created_at
  ) {
    console.warn('[WEBHOOK] Invalid or incomplete order payload');
    return NextResponse.json({ received: true });
  }

  const orderData = {
    id: Number(order.id),
    userId: Number(userId),
    totalPrice: Number(order.total_price_set.shop_money.amount),
    createdAt: order.created_at,
    financialStatus: order.financial_status || null,
    customerId: order.customer?.id ? Number(order.customer.id) : null,
    sourceName: order.source_name || null,
    shopDomain: shopDomain,  // Use the header value
  };

  // 8. Insert into database
  try {
    await db
      .insert(orders)
      .values(orderData)
      .onConflictDoNothing();

    console.log('[WEBHOOK] Order inserted successfully:', order.id, 'for user:', userId);
  } catch (err) {
    console.error('[WEBHOOK] Database insert failed:', err instanceof Error ? err.message : String(err));
  }

  // 9. Always respond 200 OK to Shopify (they retry on non-2xx)
  return NextResponse.json({ success: true });
}