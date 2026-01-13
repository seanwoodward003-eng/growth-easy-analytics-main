import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, users } from '@/src/db/schema'; // ← FIX THIS PATH/EXPORT if build error persists
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const runtime = 'nodejs';

function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[WEBHOOK] Missing X-Shopify-Hmac-Sha256');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody)
    .digest('base64');

  const isValid = crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
  if (!isValid) console.error('[WEBHOOK] HMAC mismatch');
  return isValid;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let order;
  try {
    order = JSON.parse(rawBody);
  } catch (e) {
    console.error('[WEBHOOK] JSON parse error:', e.message);
    return NextResponse.json({ received: true });
  }

  if (!order?.id || !order.shop_domain || !order.total_price_set?.shop_money?.amount) {
    console.warn('[WEBHOOK] Invalid payload');
    return NextResponse.json({ received: true });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.shopify_shop, order.shop_domain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[WEBHOOK] No user for shop:', order.shop_domain);
    return NextResponse.json({ received: true });
  }

  const userId = user.id;

  const orderData = {
    id: BigInt(order.id),
    userId: BigInt(userId),
    totalPrice: Number(order.total_price_set.shop_money.amount),
    createdAt: new Date(order.created_at),
    financialStatus: order.financial_status,
    customerId: order.customer?.id ? BigInt(order.customer.id) : null,
    sourceName: order.source_name || null,
    shopDomain: order.shop_domain, // optional — helps future lookups
  };

  try {
    await db.insert(orders)
      .values(orderData)
      .onConflictDoNothing();

    console.log('[WEBHOOK] Order inserted:', order.id, 'user:', userId);
  } catch (err) {
    console.error('[WEBHOOK] Insert failed:', err.message);
  }

  return NextResponse.json({ success: true });
}