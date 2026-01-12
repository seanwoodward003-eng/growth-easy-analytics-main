import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyWebhookHMAC(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;
  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body)
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
}

export async function POST(request: NextRequest) {
  const body = await request.text(); // raw body for HMAC
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhookHMAC(body, hmac)) {
    console.error('[WEBHOOK] HMAC verification failed');
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  let order;
  try {
    order = JSON.parse(body);
  } catch (e) {
    console.error('[WEBHOOK] Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Basic validation
  if (!order.id || !order.total_price_set?.shop_money?.amount) {
    console.log('[WEBHOOK] Missing required fields');
    return NextResponse.json({ received: true }); // still 200 to avoid Shopify retry spam
  }

  // TODO: Map to real user_id (e.g. lookup by shop domain)
  const userId = 4; // temporary hardcode – replace with real lookup later

  try {
    await run(
      `INSERT OR IGNORE INTO orders (
        id, user_id, total_price, created_at, financial_status, customer_id, source_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        userId,
        Number(order.total_price_set.shop_money.amount),
        order.created_at,
        order.financial_status,
        order.customer?.id || null,
        order.source_name || null,
      ]
    );
    console.log('[WEBHOOK] Order saved:', order.id);
  } catch (err) {
    console.error('[WEBHOOK] DB insert error:', err);
    // still return 200 so Shopify doesn't retry endlessly
  }

  return NextResponse.json({ success: true });
}