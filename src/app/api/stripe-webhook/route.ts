// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { run } from '@/lib/db';  // Import run for updates

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;

  const rawBody = await req.arrayBuffer();
  const buffer = Buffer.from(rawBody);

  let event;

  try {
    event = stripe.webhooks.constructEvent(buffer, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session — cannot upgrade user');
      return new Response('Missing userId', { status: 400 });
    }

    const plan = session.metadata?.plan || 'unknown';
    const mode = session.mode; // 'payment' = one-time (lifetime), 'subscription' = recurring

    console.log(`WEBHOOK: Payment success for user ${userId}, plan: ${plan}, mode: ${mode}`);

    let newStatus = 'active';

    if (mode === 'payment') {
      // Lifetime one-time payment
      newStatus = 'lifetime';
    }
    // else: subscription → 'active'

    try {
      // Update user's subscription_status
      await run(
        `UPDATE users SET subscription_status = ? WHERE id = ?`,
        [newStatus, userId]
      );

      console.log(`DB UPDATED: User ${userId} now has status '${newStatus}'`);
    } catch (dbError: any) {
      console.error('Failed to update user in DB:', dbError.message);
      // Don't return error — Stripe expects 2xx, we don't want retries to fail
    }
  }

  return NextResponse.json({ received: true });
}