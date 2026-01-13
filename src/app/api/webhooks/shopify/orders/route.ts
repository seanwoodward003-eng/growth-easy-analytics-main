import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // your Drizzle instance
import { orders, users } from '@/src/db/schema'; // adjust if path/export name wrong (e.g. '@/db/schema')
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const runtime = 'nodejs'; // Force Node.js to avoid Edge issues with crypto/libsql

// Verify Shopify webhook HMAC
function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[WEBHOOK] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody)
    .digest('base64');

  const isValid = crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
  if (!isValid) {
    console.error('[WEBHOOK] HMAC mismatch — calculated:', calculated.substring(0, 10) + '...', 'provided:', hmacHeader.substring(0, 10) + '...');
  }
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

  // Validation
  if (!order?.id || !order.shop_domain || !order.total_price_set?.shop_money?.amount) {
    console.warn('[WEBHOOK] Invalid order payload — missing fields');
    return NextResponse.json({ received: true });
  }

  // Lookup user_id by shop_domain
  const user = await db.query.users.findFirst({
    where: eq(users.shopify_shop, order.shop_domain),
    columns: { id: true },
  });

  if (!user) {
    console.warn('[WEBHOOK] No user for shop_domain:', order.shop_domain);
    return NextResponse.json({ received: true });
  }

  const userId = user.id;

  // Prepare data (type conversions for Drizzle)
  const orderData = {
    id: BigInt(order.id), // Shopify IDs are bigints
    userId: BigInt(userId), // assuming bigint in schema
    totalPrice: Number(order.total_price_set.shop_money.amount),
    createdAt: new Date(order.created_at), // timestamp expects Date
    financialStatus: order.financial_status,
    customerId: order.customer?.id ? BigInt(order.customer.id) : null,
    sourceName: order.source_name || null,
    // add other fields as needed
  };

  try {
    await db
      .insert(orders)
      .values(orderData)
      .onConflictDoNothing(); // or .onConflictDoUpdate() if you want to update existing

    console.log('[WEBHOOK] Order inserted:', order.id, 'for user:', userId);
  } catch (err) {
    console.error('[WEBHOOK] Drizzle insert error:', err.message);
    // 200 anyway
  }

  return NextResponse.json({ success: true });
}