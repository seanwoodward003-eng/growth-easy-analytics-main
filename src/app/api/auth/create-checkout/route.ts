// app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const { plan } = await request.json();
  const priceMap: Record<string, string> = {
    lifetime_early: process.env.STRIPE_PRICE_LTD_EARLY!,
    lifetime: process.env.STRIPE_PRICE_LTD!,
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    annual: process.env.STRIPE_PRICE_ANNUAL!,
  };

  const priceId = priceMap[plan];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const user = await getRow<{ stripe_id: string | null }>('SELECT stripe_id FROM users WHERE id = ?', [userId]);

  const session = await stripe.checkout.sessions.create({
    customer: user?.stripe_id || undefined,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: plan.includes('monthly') || plan.includes('annual') ? 'subscription' : 'payment',
    success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/pricing`,
  });

  return NextResponse.json({ sessionId: session.id });
}

export const OPTIONS = () => new Response(null, { status: 200 });