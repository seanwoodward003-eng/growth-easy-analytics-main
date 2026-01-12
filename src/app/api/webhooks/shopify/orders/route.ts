import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // your Drizzle instance
import { orders } from '@/src/db/schema'; // adjust path to your schema
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Verify Shopify webhook HMAC (required)
function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody)
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
}

export async function POST(request: NextRequest) {
  // Get raw body for HMAC (must be text(), not .json())
  const rawBody = await request.text();

  // Verify HMAC
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!verifyWebhookHMAC(rawBody, hmac)) {
    console.error('[WEBHOOK] HMAC verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error('[WEBHOOK] Invalid JSON');
    return NextResponse.json({ received: true });
  }

  const order = payload;

  // Basic validation
  if (!order?.id || !order?.shop_domain || !order.total_price_set?.shop_money?.amount) {
    console.warn('[WEBHOOK] Missing required fields');
    return NextResponse.json({ received: true });
  }

  // Lookup user by shop domain (prevents data crossover)
  const user = await db.query.users.findFirst({
    where: eq(users.shopify_shop, order.shop_domain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[WEBHOOK] No user found for shop:', order.shop_domain);
    return NextResponse.json({ received: true });
  }

  const userId = user.id;

  // Prepare data for insert
  const orderData = {
    id: order.id,
    userId,
    totalPrice: Number(order.total_price_set.shop_money.amount),
    createdAt: order.created_at,
    financialStatus: order.financial_status,
    customerId: order.customer?.id || null,
    sourceName: order.source_name || null,
    // add any other columns your schema has
  };

  try {
    // Upsert (insert or ignore if ID already exists)
    await db
      .insert(orders)
      .values(orderData)
      .onConflictDoNothing(); // or .onConflictDoUpdate() if you want to update

    console.log('[WEBHOOK] Order saved:', order.id, 'for user:', userId);
  } catch (err) {
    console.error('[WEBHOOK] Insert failed:', err);
    // still return 200 so Shopify doesn't retry forever
  }

  return NextResponse.json({ success: true });
}