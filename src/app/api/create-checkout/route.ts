// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db'; // Add 'run' for updating stripe_id

export async function POST(request: NextRequest) {
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED');

  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user;
  const userId = user.id;

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

  // Fetch current stripe_id and email
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
      customer_email: dbUser.email, // Pre-fill email in Checkout
    };

    // If no existing customer, let Stripe create one (or force for one-time)
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (!isSubscription) {
      // For one-time payments: always create a customer object
      sessionParams.customer_creation = 'always';
    }
    // For subscriptions: Stripe auto-creates customer if none provided

    const session = await stripe.checkout.sessions.create(sessionParams);

    // If a new customer was created, save the ID to your DB
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