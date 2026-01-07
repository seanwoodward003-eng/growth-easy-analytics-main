// app/api/integrations/disconnect/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { run } from '@/lib/db';

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = auth.user.id;

  try {
    const { type } = await request.json();

    if (!['shopify', 'ga4', 'hubspot'].includes(type)) {
      return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 });
    }

    // Clear the relevant fields in the users table
    if (type === 'shopify') {
      await run(
        'UPDATE users SET shopify_shop = NULL, shopify_access_token = NULL WHERE id = ?',
        [userId]
      );
    } else if (type === 'ga4') {
      await run(
        'UPDATE users SET ga4_connected = NULL WHERE id = ?', // adjust column name if different
        [userId]
      );
    } else if (type === 'hubspot') {
      await run(
        'UPDATE users SET hubspot_connected = NULL WHERE id = ?', // adjust column name if different
        [userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}