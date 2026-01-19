// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { run, getRow } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Handle successful checkout (first payment)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session');
      return new Response('Missing userId', { status: 400 });
    }

    const plan = session.metadata?.plan || 'unknown';
    const mode = session.mode;

    let newStatus = 'active';
    if (mode === 'payment') {
      newStatus = 'lifetime';
    }

    await run('UPDATE users SET subscription_status = ? WHERE id = ?', [newStatus, parseInt(userId)]);

    // Send welcome email
    const user = await getRow<{ email: string }>('SELECT email FROM users WHERE id = ?', [parseInt(userId)]);
    if (user) {
      await resend.emails.send({
        from: 'GrowthEasy AI <noreply@resend.dev>',
        to: user.email,
        subject: 'Welcome to GrowthEasy AI — Access Activated!',
        html: `... your welcome HTML ...`, // paste the full welcome HTML from earlier
      });
    }
  }

  // Handle successful recurring payment (renewal)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', ['active', parseInt(userId)]);
      console.log(`Renewal success — user ${userId} status restored to active`);
    }
  }

  // Handle failed payment
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', ['canceled', parseInt(userId)]);
      console.log(`Payment failed — user ${userId} access restricted`);

      // Optional: send "payment failed" email
      const user = await getRow<{ email: string }>('SELECT email FROM users WHERE id = ?', [parseInt(userId)]);
      if (user) {
        await resend.emails.send({
          from: 'GrowthEasy AI <no-reply@growtheasy.ai>',
          to: user.email,
          subject: 'Payment Failed — Update Your Card',
          html: `
            <html>
              <body style="background: #0a0f2c; color: #e0f8ff;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0f2c; border: 2px solid #ff4444;">
                  <h1 style="color: #ff4444; text-align: center;">Payment Failed</h1>
                  <p style="font-size: 18px; text-align: center;">
                    Your recent payment didn't go through.<br>
                    Update your card to keep access.
                  </p>
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background: #ff4444; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
                      Update Payment Method
                    </a>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      }
    }
  }

  // Handle cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    const userId = subscription.metadata.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', ['canceled', parseInt(userId)]);
      console.log(`Subscription canceled — user ${userId} access restricted`);
    }
  }

  return NextResponse.json({ received: true });
}