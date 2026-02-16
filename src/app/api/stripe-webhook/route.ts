// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'micro'; // Install: npm install micro
import { run, getRow } from '@/lib/db';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false, // Required for raw body
  },
};

export async function POST(req: NextRequest) {
  const buf = await buffer(req);
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('Webhook received:', event.type);

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session metadata');
      return NextResponse.json({ received: true });
    }

    const plan = session.metadata?.plan || 'unknown';
    const mode = session.mode;

    let newStatus = 'active';
    if (mode === 'payment') {
      newStatus = 'lifetime';
    }

    await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
      newStatus,
      parseInt(userId),
    ]);

    // Send welcome email
    const user = await getRow<{ email: string }>(
      'SELECT email FROM users WHERE id = ?',
      [parseInt(userId)]
    );

    if (user?.email) {
      try {
        await resend.emails.send({
          from: 'GrowthEasy AI <noreply@resend.dev>',
          to: user.email,
          subject: 'Welcome to GrowthEasy AI — Access Activated!',
          html: `
            <html>
              <body style="background: #0a0f2c; color: #e0f8ff; font-family: sans-serif;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #111733; border-radius: 16px; border: 2px solid #00d4ff;">
                  <h1 style="color: #00d4ff; text-align: center;">Welcome aboard!</h1>
                  <p style="font-size: 18px; text-align: center;">
                    Thanks for upgrading — your <strong>${plan}</strong> access is now active!
                  </p>
                  <p style="text-align: center;">
                    You now have full access to the AI Growth Coach, advanced metrics, and more.
                  </p>
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="background: #00d4ff; color: #0a0f2c; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                      Go to Dashboard
                    </a>
                  </div>
                  <p style="text-align: center; font-size: 14px; color: #88ccff;">
                    Questions? Reply here or email support@growtheasy.ai
                  </p>
                </div>
              </body>
            </html>
          `,
        });
        console.log('Welcome email sent to', user.email);
      } catch (emailErr) {
        console.error('Failed to send welcome email', emailErr);
      }
    }
  }

  // invoice.paid (recurring renewal)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'active',
        parseInt(userId),
      ]);
      console.log(`Renewal success — user ${userId} status restored`);
    }
  }

  // invoice.payment_failed
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'canceled',
        parseInt(userId),
      ]);
      console.log(`Payment failed — user ${userId} access restricted`);

      const user = await getRow<{ email: string }>(
        'SELECT email FROM users WHERE id = ?',
        [parseInt(userId)]
      );

      if (user?.email) {
        try {
          await resend.emails.send({
            from: 'GrowthEasy AI <no-reply@growtheasy.ai>',
            to: user.email,
            subject: 'Payment Failed — Update Your Card',
            html: `
              <html>
                <body style="background: #0a0f2c; color: #e0f8ff; font-family: sans-serif;">
                  <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #111733; border-radius: 16px; border: 2px solid #ff4444;">
                    <h1 style="color: #ff4444; text-align: center;">Payment Failed</h1>
                    <p style="font-size: 18px; text-align: center;">
                      Your recent payment didn't go through.<br>
                      Please update your card to keep access.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
                         style="background: #ff4444; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                        Update Payment Method
                      </a>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
        } catch (emailErr) {
          console.error('Failed to send payment failed email', emailErr);
        }
      }
    }
  }

  // customer.subscription.deleted
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;

    if (userId) {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'canceled',
        parseInt(userId),
      ]);
      console.log(`Subscription canceled — user ${userId} access restricted`);
    }
  }

  return NextResponse.json({ received: true });
}