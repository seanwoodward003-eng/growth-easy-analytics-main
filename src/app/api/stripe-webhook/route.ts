// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,  // Required for Stripe webhooks
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;

  // Properly read the raw body as Buffer
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
    const plan = session.metadata?.plan || 'unknown';

    console.log(`WEBHOOK SUCCESS: Payment completed for user ${userId}, plan: ${plan}`);
  }

  return NextResponse.json({ received: true });
}