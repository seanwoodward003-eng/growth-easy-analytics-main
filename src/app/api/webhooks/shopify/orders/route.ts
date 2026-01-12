import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import crypto from 'crypto';

// Helper to verify Shopify webhook HMAC (mandatory for security)
function verifyWebhookHMAC(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) {
    console.error('[WEBHOOK] Missing X-Shopify-Hmac-Sha256 header');
    return false;
  }

  const calculatedHMAC = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(rawBody)
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculatedHMAC),
    Buffer.from(hmacHeader)
  );

  if (!isValid) {
    console.error('[WEBHOOK] HMAC verification failed');
    console.log('[WEBHOOK] Calculated:', calculatedHMAC.substring(0, 10) + '...');
    console.log('[WEBHOOK] Provided:', hmacHeader.substring(0, 10) + '...');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  // Get raw body for HMAC verification (must be before .json())
  const rawBody = await request.text();

  // Verify HMAC
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!verifyWebhookHMAC(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let order;
  try {
    order = JSON.parse(rawBody);
  } catch (e) {
    console.error('[WEBHOOK] Failed to parse JSON payload:', e);
    return NextResponse.json({ received: true }); // 200 to prevent Shopify retry spam
  }

  // Basic required fields check
  if (!order?.id || !order?.shop_domain || !order.total_price_set?.shop_money?.amount) {
    console.warn('[WEBHOOK] Missing required order fields:', { id: order?.id });
    return NextResponse.json({ received: true });
  }

  // Lookup user_id from shop domain (critical for no data crossover)
  const user = await getRow<{ id: number }>(
    'SELECT id FROM users WHERE shopify_shop = ?',
    [order.shop_domain]
  );

  if (!user) {
    console.warn('[WEBHOOK] No user found for shop domain:', order.shop_domain);
    return NextResponse.json({ received: true }); // still ack
  }

  const userId = user.id;

  // Extract useful fields (adjust based on your orders table schema)
  const totalPrice = Number(order.total_price_set.shop_money.amount);
  const createdAt = order.created_at;
  const financialStatus = order.financial_status;
  const customerId = order.customer?.id || null;
  const sourceName = order.source_name || null;

  try {
    await run(
      `INSERT OR IGNORE INTO orders (
        id,
        user_id,
        total_price,
        created_at,
        financial_status,
        customer_id,
        source_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        userId,
        totalPrice,
        createdAt,
        financialStatus,
        customerId,
        sourceName,
      ]
    );

    console.log('[WEBHOOK] Order successfully saved:', {
      orderId: order.id,
      userId,
      totalPrice,
      shop: order.shop_domain,
    });
  } catch (dbErr) {
    console.error('[WEBHOOK] Failed to insert order:', dbErr);
    // Still return 200 so Shopify doesn't keep retrying
  }

  return NextResponse.json({ success: true });
}