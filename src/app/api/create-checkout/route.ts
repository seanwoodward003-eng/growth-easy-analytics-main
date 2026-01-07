// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Quick version log to confirm this code is running
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED - FIXED VERSION JAN 2026');

  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const body = await request.json();
  const { plan } = body;

  console.log('Received plan from frontend:', plan);

  // IMPORTANT: Keys now match exactly what frontend sends
  const priceMap: Record<string, string> = {
    early_ltd: process.env.STRIPE_PRICE_EARLY_LTD!,
    standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD!,
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    annual: process.env.STRIPE_PRICE_ANNUAL!,
  };

  console.log('Available plans in priceMap:', Object.keys(priceMap));
  console.log('Env values loaded:', {
    early_ltd: process.env.STRIPE_PRICE_EARLY_LTD ? 'present' : 'MISSING',
    standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD ? 'present' : 'MISSING',
    monthly: process.env.STRIPE_PRICE_MONTHLY ? 'present' : 'MISSING',
    annual: process.env.STRIPE_PRICE_ANNUAL ? 'present' : 'MISSING',
  });

  const priceId = priceMap[plan as keyof typeof priceMap];

  console.log('Resolved priceId:', priceId || 'UNDEFINED');

  if (!priceId) {
    console.log('INVALID PLAN TRIGGERED for received plan:', plan);
    return NextResponse.json(
      {
        error: 'Invalid plan',
        receivedPlan: plan,
        validPlans: Object.keys(priceMap),
      },
      { status: 400 }
    );
  }

  const user = await getRow<{ stripe_id: string | null }>('SELECT stripe_id FROM users WHERE id = ?', [userId]);

  try {
    const session = await stripe.checkout.sessions.create({
      customer: user?.stripe_id || undefined,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === 'monthly' || plan === 'annual' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/pricing`,
    });

    console.log('Stripe session created successfully:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('STRIPE ERROR DETAILS:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      raw: error,
    });

    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        stripeType: error.type,
        stripeCode: error.code,
        stripeParam: error.param,
      },
      { status: 500 }
    );
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });