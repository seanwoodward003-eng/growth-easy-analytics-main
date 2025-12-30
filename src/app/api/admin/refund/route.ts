// app/api/admin/refund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  // ONLY YOU CAN ACCESS — change to your email
  if (!currentUser || currentUser.email !== 'seanwoodward10@yahoo.co.uk') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const userIdStr = formData.get('user_id') as string;
  const userId = parseInt(userIdStr);

  if (!userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });

  const user = await getRow<{ stripe_id: string | null }>('SELECT stripe_id FROM users WHERE id = ?', [userId]);
  if (!user?.stripe_id) return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 });

  try {
    const charges = await stripe.charges.list({ customer: user.stripe_id, limit: 1 });
    if (charges.data.length === 0) return NextResponse.json({ error: 'No charges to refund' }, { status: 400 });

    const latestCharge = charges.data[0];
    await stripe.refunds.create({ charge: latestCharge.id });

    await run('UPDATE users SET subscription_status = ? WHERE id = ?', ['canceled', userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}