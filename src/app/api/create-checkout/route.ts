// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED');

  const auth = await requireAuth();

  // Allow trial_expired users to upgrade — only block real unauthorized
  if ('error' in auth && auth.error !== 'trial_expired') {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Get userId — it's there even if trial expired
  const userId = auth.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await request.json();

  console.log('Received plan:', plan);

  const priceMap: Record<string, string> = {
    early_ltd: process.env.STRIPE_PRICE_EARLY_LTD!,
    standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD!,
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    annual: process.env.STRIPE_PRICE_ANNUAL!,
  };

  const priceId = priceMap[plan];

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan', received: plan }, { status: 400 });
  }

  const dbUser = await getRow<{ stripe_id: string | null; email: string }>(
    'SELECT stripe_id, email FROM users WHERE id = ?',
    [userId]
  );

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let customerId = dbUser.stripe_id;

  try {
    const isSubscription = plan === 'monthly' || plan === 'annual';

    const sessionParams: any = {
      client_reference_id: userId.toString(),
      metadata: { plan, user_id: userId.toString() },
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: dbUser.email,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (!isSubscription) {
      sessionParams.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (session.customer && typeof session.customer === 'string' && !customerId) {
      await run('UPDATE users SET stripe_id = ? WHERE id = ?', [session.customer, userId]);
      console.log(`Saved new Stripe customer ${session.customer} for user ${userId}`);
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });