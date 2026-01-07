// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED - FINAL CACHE BUST VERSION');

  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const { plan } = await request.json();

  console.log('Received plan:', plan);

  // TEMPORARY CHANGE: use the renamed env var for Early Bird to bypass Vercel cache
  const priceMap: Record<string, string> = {
    early_ltd: process.env.STRIPE_PRICE_EARLY_LTD_FIXED!,  // ← renamed to force fresh load
    standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD!,
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    annual: process.env.STRIPE_PRICE_ANNUAL!,
  };

  // Log what the function actually sees (this will show if cache is busted)
  console.log('Env var values in function:', {
    early_ltd: process.env.STRIPE_PRICE_EARLY_LTD_FIXED || 'UNDEFINED',
    standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD || 'UNDEFINED',
    monthly: process.env.STRIPE_PRICE_MONTHLY || 'UNDEFINED',
    annual: process.env.STRIPE_PRICE_ANNUAL || 'UNDEFINED',
  });

  const priceId = priceMap[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan', received: plan }, { status: 400 });
  }

  console.log('Using priceId:', priceId);

  const user = await getRow<{ stripe_id: string | null }>('SELECT stripe_id FROM users WHERE id = ?', [userId]);

  try {
    const session = await stripe.checkout.sessions.create({
      customer: user?.stripe_id || undefined,
      client_reference_id: userId.toString(),  // for webhook
      metadata: { plan },                       // backup plan info
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === 'monthly' || plan === 'annual' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/pricing`,
    });

    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
    });

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });