// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED');

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

  // Public — no userId required (but if logged in, we can use it for customer)
  const cookies = request.cookies;
  const accessToken = cookies.get('access_token')?.value;
  let userId: number | null = null;
  let email: string | null = null;
  let stripeId: string | null = null;

  if (accessToken) {
    try {
      const jwt = await import('jsonwebtoken');
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET || process.env.SECRET_KEY!) as any;
      userId = payload.sub;
      const dbUser = await getRow<{ email: string; stripe_id: string | null }>(
        'SELECT email, stripe_id FROM users WHERE id = ?',
        [userId]
      );
      if (dbUser) {
        email = dbUser.email;
        stripeId = dbUser.stripe_id;
      }
    } catch {}
  }

  try {
    const isSubscription = plan === 'monthly' || plan === 'annual';

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { plan },
    };

    if (userId) {
      sessionParams.client_reference_id = userId.toString();
    }
    if (email) {
      sessionParams.customer_email = email;
    }
    if (stripeId) {
      sessionParams.customer = stripeId;
    } else if (!isSubscription) {
      sessionParams.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (session.customer && typeof session.customer === 'string' && userId && !stripeId) {
      await run('UPDATE users SET stripe_id = ? WHERE id = ?', [session.customer, userId]);
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });