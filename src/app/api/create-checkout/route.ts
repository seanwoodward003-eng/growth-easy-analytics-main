// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('>>> CREATE-CHECKOUT ROUTE LOADED - START');

  try {
    const body = await request.json();
    console.log('Request body received:', body);

    const { plan } = body;
    console.log('Extracted plan:', plan);

    if (!plan) {
      console.error('No plan provided in request body');
      return NextResponse.json({ error: 'No plan provided' }, { status: 400 });
    }

    // Log all price env vars to confirm they're loaded
    console.log('STRIPE_PRICE_EARLY_LTD:', process.env.STRIPE_PRICE_EARLY_LTD);
    console.log('STRIPE_PRICE_STANDARD_LTD:', process.env.STRIPE_PRICE_STANDARD_LTD);
    console.log('STRIPE_PRICE_MONTHLY:', process.env.STRIPE_PRICE_MONTHLY);
    console.log('STRIPE_PRICE_ANNUAL:', process.env.STRIPE_PRICE_ANNUAL);

    const priceMap: Record<string, string> = {
      early_ltd: process.env.STRIPE_PRICE_EARLY_LTD!,
      standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD!,
      monthly: process.env.STRIPE_PRICE_MONTHLY!,
      annual: process.env.STRIPE_PRICE_ANNUAL!,
    };

    const priceId = priceMap[plan];
    console.log('Selected priceId for plan', plan, ':', priceId);

    if (!priceId) {
      console.error('Invalid plan - no matching priceId:', plan);
      return NextResponse.json({ error: 'Invalid plan', received: plan }, { status: 400 });
    }

    // Check for logged-in user (optional)
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;
    let userId: number | null = null;
    let email: string | null = null;
    let stripeId: string | null = null;

    if (accessToken) {
      console.log('Access token found in cookies - attempting to verify');
      try {
        const jwt = await import('jsonwebtoken');
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET || process.env.SECRET_KEY!) as any;
        userId = payload.sub;
        console.log('JWT verified - userId:', userId);

        const dbUser = await getRow<{ email: string; stripe_id: string | null }>(
          'SELECT email, stripe_id FROM users WHERE id = ?',
          [userId]
        );

        if (dbUser) {
          email = dbUser.email;
          stripeId = dbUser.stripe_id;
          console.log('User found in DB - email:', email, 'stripeId:', stripeId);
        } else {
          console.warn('No user found in DB for id:', userId);
        }
      } catch (jwtErr) {
        console.error('JWT verification failed:', jwtErr);
      }
    } else {
      console.log('No access_token cookie - treating as guest checkout');
    }

    const isSubscription = plan === 'monthly' || plan === 'annual';
    console.log('Checkout mode:', isSubscription ? 'subscription' : 'payment');

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
      console.log('Added client_reference_id:', userId);
    }
    if (email) {
      sessionParams.customer_email = email;
      console.log('Added customer_email:', email);
    }
    if (stripeId) {
      sessionParams.customer = stripeId;
      console.log('Using existing customer ID:', stripeId);
    } else if (!isSubscription) {
      sessionParams.customer_creation = 'always';
      console.log('Creating new customer on payment');
    }

    console.log('Creating Stripe Checkout session with params:', sessionParams);

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Stripe session created successfully');
    console.log('Session ID:', session.id);
    console.log('Session mode:', session.mode);
    console.log('Session customer:', session.customer);
    console.log('Session status:', session.status);

    // If new customer created and user logged in, save stripe_id
    if (session.customer && typeof session.customer === 'string' && userId && !stripeId) {
      console.log('Saving new stripe_id to DB:', session.customer);
      await run('UPDATE users SET stripe_id = ? WHERE id = ?', [session.customer, userId]);
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('CREATE-CHECKOUT CRITICAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });