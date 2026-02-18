// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('[CREATE-CHECKOUT] === ROUTE INVOKED ===');
  console.log('[CREATE-CHECKOUT] Timestamp:', new Date().toISOString());
  console.log('[CREATE-CHECKOUT] Full request URL:', request.url);
  console.log('[CREATE-CHECKOUT] Method:', request.method);
  console.log('[CREATE-CHECKOUT] Headers received:', Object.fromEntries(request.headers.entries()));
  console.log('[CREATE-CHECKOUT] Cookies received:', request.cookies.getAll().map(c => `${c.name}=[hidden]`));

  try {
    console.log('[CREATE-CHECKOUT] Reading request body...');
    const body = await request.json();
    console.log('[CREATE-CHECKOUT] Body parsed successfully:', JSON.stringify(body, null, 2));

    const { plan } = body;
    console.log('[CREATE-CHECKOUT] Extracted plan:', plan);

    if (!plan) {
      console.error('[CREATE-CHECKOUT] No plan in body');
      return NextResponse.json({ error: 'No plan provided' }, { status: 400 });
    }

    console.log('[CREATE-CHECKOUT] All price env vars:');
    console.log('  STRIPE_PRICE_EARLY_LTD:', process.env.STRIPE_PRICE_EARLY_LTD || '[missing]');
    console.log('  STRIPE_PRICE_STANDARD_LTD:', process.env.STRIPE_PRICE_STANDARD_LTD || '[missing]');
    console.log('  STRIPE_PRICE_MONTHLY:', process.env.STRIPE_PRICE_MONTHLY || '[missing]');
    console.log('  STRIPE_PRICE_ANNUAL:', process.env.STRIPE_PRICE_ANNUAL || '[missing]');

    const priceMap: Record<string, string> = {
      early_ltd: process.env.STRIPE_PRICE_EARLY_LTD!,
      standard_ltd: process.env.STRIPE_PRICE_STANDARD_LTD!,
      monthly: process.env.STRIPE_PRICE_MONTHLY!,
      annual: process.env.STRIPE_PRICE_ANNUAL!,
    };

    const priceId = priceMap[plan];
    console.log('[CREATE-CHECKOUT] Selected priceId for', plan, ':', priceId || '[MISSING]');

    if (!priceId) {
      console.error('[CREATE-CHECKOUT] No priceId found for plan:', plan);
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Auth check
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;
    let userId: number | null = null;
    let email: string | null = null;
    let stripeId: string | null = null;

    console.log('[CREATE-CHECKOUT] Access token cookie exists?', !!accessToken);

    if (accessToken) {
      console.log('[CREATE-CHECKOUT] Verifying JWT...');
      try {
        const jwt = await import('jsonwebtoken');
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET || process.env.SECRET_KEY!) as any;
        userId = payload.sub;
        console.log('[CREATE-CHECKOUT] JWT verified - userId:', userId);

        console.log('[CREATE-CHECKOUT] Fetching user from DB...');
        const dbUser = await getRow<{ email: string; stripe_id: string | null }>(
          'SELECT email, stripe_id FROM users WHERE id = ?',
          [userId]
        );

        if (dbUser) {
          email = dbUser.email;
          stripeId = dbUser.stripe_id;
          console.log('[CREATE-CHECKOUT] User found - email:', email, 'stripeId:', stripeId || 'none');
        } else {
          console.warn('[CREATE-CHECKOUT] No user found in DB for id:', userId);
        }
      } catch (jwtErr) {
        console.error('[CREATE-CHECKOUT] JWT verification failed:', jwtErr);
      }
    } else {
      console.log('[CREATE-CHECKOUT] No access_token - proceeding as guest');
    }

    const isSubscription = plan === 'monthly' || plan === 'annual';
    console.log('[CREATE-CHECKOUT] Checkout mode:', isSubscription ? 'subscription' : 'payment');

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
      console.log('[CREATE-CHECKOUT] Added client_reference_id:', userId);
    }
    if (email) {
      sessionParams.customer_email = email;
      console.log('[CREATE-CHECKOUT] Added customer_email:', email);
    }
    if (stripeId) {
      sessionParams.customer = stripeId;
      console.log('[CREATE-CHECKOUT] Using existing customer:', stripeId);
    } else if (!isSubscription) {
      sessionParams.customer_creation = 'always';
      console.log('[CREATE-CHECKOUT] Setting customer_creation=always');
    }

    console.log('[CREATE-CHECKOUT] Full session params:', JSON.stringify(sessionParams, null, 2));

    console.log('[CREATE-CHECKOUT] Calling stripe.checkout.sessions.create...');
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[CREATE-CHECKOUT] Stripe session created successfully');
    console.log('[CREATE-CHECKOUT] Session ID:', session.id);
    console.log('[CREATE-CHECKOUT] Session mode:', session.mode);
    console.log('[CREATE-CHECKOUT] Session customer:', session.customer);
    console.log('[CREATE-CHECKOUT] Session status:', session.status);
    console.log('[CREATE-CHECKOUT] Session url (for fallback):', session.url);

    // Optional DB update for new customer
    if (session.customer && typeof session.customer === 'string' && userId && !stripeId) {
      console.log('[CREATE-CHECKOUT] Saving new stripe_id to DB:', session.customer);
      await run('UPDATE users SET stripe_id = ? WHERE id = ?', [session.customer, userId]);
      console.log('[CREATE-CHECKOUT] stripe_id saved successfully');
    }

    // Prepare response
    const responseBody = {
      sessionId: session.id,
      url: session.url, // useful for fallback
    };

    console.log('[CREATE-CHECKOUT] Preparing to return response');
    console.log('[CREATE-CHECKOUT] Final response body:', JSON.stringify(responseBody, null, 2));

    return NextResponse.json(responseBody);
  } catch (error: any) {
    console.error('[CREATE-CHECKOUT] CRITICAL ERROR CAUGHT:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export const OPTIONS = () => {
  console.log('[CREATE-CHECKOUT] OPTIONS preflight request received');
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // or your frontend URL
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};