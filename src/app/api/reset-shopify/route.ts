import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST() {
  const auth = await requireAuth();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = auth.user.id;

  try {
    await db
      .update(users)
      .set({
        shopifyShop: null,
        shopifyAccessToken: null,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: 'Shopify connection reset' });
  } catch (err) {
    console.error('[RESET-SHOPIFY] Failed:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}