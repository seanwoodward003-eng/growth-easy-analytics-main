import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pull stored shop and token from DB
  const userData = await getRow<{ shopify_shop: string; shopify_access_token: string }>(
    'SELECT shopify_shop, shopify_access_token FROM users WHERE id = ?',
    [user.id]
  );

  if (!userData || !userData.shopify_shop || !userData.shopify_access_token) {
    return NextResponse.json({ error: 'No Shopify connection found for this user' }, { status: 400 });
  }

  const shop = userData.shopify_shop;
  const access_token = userData.shopify_access_token;

  console.log('[WEBHOOK-REG] Manual registration started for shop:', shop);

  const webhookAddress = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/orders`;

  try {
    const webhookResp = await fetch(`https://${shop}/admin/api/2026-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: {
          topic: 'orders/create',
          address: webhookAddress,
          format: 'json',
        },
      }),
    });

    if (!webhookResp.ok) {
      const errText = await webhookResp.text();
      console.error('[WEBHOOK-REG] Registration failed:', webhookResp.status, errText);
      return NextResponse.json({ error: `Failed to register: ${errText}` }, { status: webhookResp.status });
    }

    const respData = await webhookResp.json();
    console.log('[WEBHOOK-REG] Registered successfully! Webhook ID:', respData.webhook?.id);

    return NextResponse.json({ success: true, webhookId: respData.webhook?.id });
  } catch (err) {
    console.error('[WEBHOOK-REG] Exception during registration:', err);
    return NextResponse.json({ error: 'Internal error during registration' }, { status: 500 });
  }
}