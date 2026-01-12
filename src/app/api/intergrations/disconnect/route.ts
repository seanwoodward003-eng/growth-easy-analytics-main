import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('DISCONNECT: Endpoint hit at', new Date().toISOString());

  try {
    const auth = await requireAuth();
    console.log('DISCONNECT: requireAuth result:', auth);

    if ('error' in auth) {
      console.error('DISCONNECT: Auth failed -', auth.error);
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const userId = auth.user.id;
    console.log('DISCONNECT: Authenticated user ID:', userId);

    let body;
    try {
      body = await request.json();
      console.log('DISCONNECT: Request body:', body);
    } catch (e) {
      console.error('DISCONNECT: Invalid JSON body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { type } = body;
    console.log('DISCONNECT: Requested type:', type);

    if (!type || !['shopify', 'ga4', 'hubspot'].includes(type)) {
      console.log('DISCONNECT: Invalid type');
      return NextResponse.json({ error: 'Invalid or missing integration type' }, { status: 400 });
    }

    let query = '';
    let params = [userId];

    if (type === 'shopify') {
      query = 'UPDATE users SET shopify_shop = NULL, shopify_access_token = NULL WHERE id = ?';
      console.log('DISCONNECT: Clearing Shopify for user', userId);
    } else if (type === 'ga4') {
      query = 'UPDATE users SET ga4_connected = NULL, ga4_access_token = NULL, ga4_refresh_token = NULL WHERE id = ?';
      console.log('DISCONNECT: Clearing GA4 for user', userId);
    } else if (type === 'hubspot') {
      query = 'UPDATE users SET hubspot_connected = NULL, hubspot_access_token = NULL WHERE id = ?';
      console.log('DISCONNECT: Clearing HubSpot for user', userId);
    }

    console.log('DISCONNECT: About to run query:', query, 'with params:', params);
    await run(query, params);
    console.log('DISCONNECT: DB update success for', type);

    return NextResponse.json({ success: true, disconnected: type });
  } catch (error) {
    console.error('DISCONNECT: Critical error in route handler:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect integration',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}