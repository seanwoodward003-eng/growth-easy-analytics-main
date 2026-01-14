import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, users, orders } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[ORDERS/WEBHOOK] Missing X-Shopify-Hmac-Sha256 header');
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
    console.error('[ORDERS/WEBHOOK] HMAC mismatch');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error('[ORDERS/WEBHOOK] JSON parse error:', e);
    return NextResponse.json({ received: true });
  }

  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
  console.log('[ORDERS/WEBHOOK] Webhook received for shop:', shopDomain);

  if (!shopDomain) {
    console.warn('[ORDERS/WEBHOOK] Missing X-Shopify-Shop-Domain header');
    return NextResponse.json({ received: true });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.shopifyShop, shopDomain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[ORDERS/WEBHOOK] No user found for shop domain:', shopDomain);
    return NextResponse.json({ received: true });
  }

  console.log('[ORDERS/WEBHOOK] Matched to user ID:', user.id);

  const order = payload;

  if (
    !order?.id ||
    !order.total_price_set?.shop_money?.amount ||
    !order.created_at
  ) {
    console.warn('[ORDERS/WEBHOOK] Invalid or incomplete order payload');
    return NextResponse.json({ received: true });
  }

  const orderData = {
    id: Number(order.id),
    userId: Number(user.id),
    totalPrice: Number(order.total_price_set.shop_money.amount),
    createdAt: order.created_at,
    financialStatus: order.financial_status || null,
    customerId: order.customer?.id ? Number(order.customer.id) : null,
    sourceName: order.source_name || null,
    shopDomain: shopDomain,
  };

  try {
    await db
      .insert(orders)
      .values(orderData)
      .onConflictDoNothing();

    console.log('[ORDERS/WEBHOOK] Order inserted successfully:', order.id, 'for user:', user.id);
  } catch (err) {
    console.error('[ORDERS/WEBHOOK] Database insert failed:', err);
  }

  return NextResponse.json({ success: true });
}