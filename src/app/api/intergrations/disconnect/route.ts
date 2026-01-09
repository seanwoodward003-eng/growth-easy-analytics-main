// app/api/integrations/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('Disconnect endpoint hit');

  const auth = await requireAuth();
  if ('error' in auth) {
    console.error('Disconnect auth failed:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const userId = auth.user.id;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error('Invalid JSON in disconnect body:', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { type } = body;

  console.log('Disconnect type:', type, 'for user ID:', userId);

  if (!type || !['shopify', 'ga4', 'hubspot'].includes(type)) {
    return NextResponse.json({ error: 'Invalid or missing integration type' }, { status: 400 });
  }

  try {
    let query = '';
    let params: any[] = [userId];

    if (type === 'shopify') {
      query = 'UPDATE users SET shopify_shop = NULL, shopify_access_token = NULL WHERE id = ?';
    } else if (type === 'ga4') {
      query = 'UPDATE users SET ga4_connected = NULL, ga4_access_token = NULL, ga4_refresh_token = NULL, ga4_property_id = NULL WHERE id = ?';
    } else if (type === 'hubspot') {
      query = 'UPDATE users SET hubspot_connected = NULL, hubspot_access_token = NULL WHERE id = ?';
    }

    await run(query, params);

    console.log(`Disconnect successful for ${type}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect DB error:', error);
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
  }
}