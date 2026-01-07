// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,  // Critical for Stripe webhooks
  },
};

async function buffer(req: NextRequest) {
  const chunks = [];
  for await (const chunk of req.body!) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const buf = await buffer(req);
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session');
      return new Response('Missing userId', { status: 400 });
    }

    const plan = session.metadata?.plan || 'unknown';

    console.log(`Payment successful! User ID: ${userId}, Plan: ${plan}`);

    // TODO: Update your database here to grant access
    // Example:
    // await db.execute('UPDATE users SET plan = ?, paid = 1 WHERE id = ?', [plan, userId]);
  }

  return NextResponse.json({ received: true });
}