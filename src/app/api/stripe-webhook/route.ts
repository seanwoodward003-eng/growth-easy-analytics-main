// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { run, getRow } from '@/lib/db';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',  // Current GA version as of Feb 2026 – fixes type error
  // Optional: typescript: true for stricter response types if desired
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log('>>> STRIPE WEBHOOK ROUTE LOADED');

  // Get raw payload and signature
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  console.log('Webhook raw payload length:', payload.length);
  console.log('Stripe-Signature header:', sig || 'MISSING');

  if (!sig) {
    console.error('Webhook: Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log('Webhook: Attempting signature verification');
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook: Signature verification SUCCESS');
  } catch (err: any) {
    console.error('Webhook: Signature verification FAILED');
    console.error('Error message:', err.message);
    console.error('Error type:', err.type);
    console.error('Full error:', JSON.stringify(err, null, 2));
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('Webhook received event type:', event.type);
  console.log('Event ID:', event.id);
  console.log('Event data object keys:', Object.keys(event.data.object));

  // Log full event data for debugging (remove or limit in production if too verbose)
  console.log('Full event data:', JSON.stringify(event.data.object, null, 2));

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    console.log('Handling checkout.session.completed');
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('Session ID:', session.id);
    console.log('Session mode:', session.mode);
    console.log('Client reference ID (userId):', session.client_reference_id);
    console.log('Metadata:', session.metadata);

    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session.client_reference_id');
      return NextResponse.json({ received: true });
    }

    const plan = session.metadata?.plan || 'unknown';
    const mode = session.mode;

    console.log('Updating user subscription - userId:', userId, 'plan:', plan, 'mode:', mode);

    let newStatus = 'active';
    if (mode === 'payment') {
      newStatus = 'lifetime';
    }

    try {
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        newStatus,
        parseInt(userId),
      ]);
      console.log('DB update success - new status:', newStatus);
    } catch (dbErr) {
      console.error('DB update failed for user', userId, dbErr);
    }

    // Send welcome email
    const user = await getRow<{ email: string }>(
      'SELECT email FROM users WHERE id = ?',
      [parseInt(userId)]
    );

    if (user?.email) {
      console.log('Sending welcome email to:', user.email);
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
        console.log('Welcome email sent successfully to', user.email);
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    } else {
      console.log('No email found for userId:', userId);
    }
  }

  // invoice.paid (recurring renewal)
  else if (event.type === 'invoice.paid') {
    console.log('Handling invoice.paid');
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('No subscriptionId in invoice - skipping');
      return NextResponse.json({ received: true });
    }

    console.log('Retrieving subscription:', subscriptionId);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;

    if (userId) {
      console.log('Updating user status to active - userId:', userId);
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'active',
        parseInt(userId),
      ]);
      console.log('Renewal success - user', userId, 'status restored to active');
    } else {
      console.log('No user_id in subscription metadata');
    }
  }

  // invoice.payment_failed
  else if (event.type === 'invoice.payment_failed') {
    console.log('Handling invoice.payment_failed');
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('No subscriptionId in invoice - skipping');
      return NextResponse.json({ received: true });
    }

    console.log('Retrieving subscription for failed payment:', subscriptionId);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;

    if (userId) {
      console.log('Updating user status to canceled - userId:', userId);
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'canceled',
        parseInt(userId),
      ]);
      console.log('Payment failed - user', userId, 'access restricted');

      const user = await getRow<{ email: string }>(
        'SELECT email FROM users WHERE id = ?',
        [parseInt(userId)]
      );

      if (user?.email) {
        console.log('Sending payment failed email to:', user.email);
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
          console.log('Payment failed email sent to', user.email);
        } catch (emailErr) {
          console.error('Failed to send payment failed email:', emailErr);
        }
      }
    }
  }

  // customer.subscription.deleted
  else if (event.type === 'customer.subscription.deleted') {
    console.log('Handling customer.subscription.deleted');
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;

    if (userId) {
      console.log('Updating user status to canceled - userId:', userId);
      await run('UPDATE users SET subscription_status = ? WHERE id = ?', [
        'canceled',
        parseInt(userId),
      ]);
      console.log('Subscription canceled - user', userId, 'access restricted');
    } else {
      console.log('No user_id in subscription metadata');
    }
  }

  // Log unhandled events
  else {
    console.log('Webhook: Unhandled event type:', event.type);
  }

  console.log('Webhook processing complete - returning 200');

  // Always return 200 to Stripe (prevents retries)
  return NextResponse.json({ received: true });
}