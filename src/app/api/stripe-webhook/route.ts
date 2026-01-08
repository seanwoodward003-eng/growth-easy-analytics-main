// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { run, getRow } from '@/lib/db';  // Add getRow for email
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No userId in session — cannot upgrade user');
      return new Response('Missing userId', { status: 400 });
    }

    const plan = session.metadata?.plan || 'unknown';
    const mode = session.mode; // 'payment' = one-time, 'subscription' = recurring

    console.log(`WEBHOOK: Payment success for user ${userId}, plan: ${plan}, mode: ${mode}`);

    let newStatus = 'active';

    if (mode === 'payment') {
      newStatus = 'lifetime';
    }

    try {
      await run(
        `UPDATE users SET subscription_status = ? WHERE id = ?`,
        [newStatus, parseInt(userId)]
      );

      console.log(`DB UPDATED: User ${userId} now has status '${newStatus}'`);
    } catch (dbError: any) {
      console.error('Failed to update user status:', dbError.message);
    }

    // Send welcome email
    try {
      const user = await getRow<{ email: string }>('SELECT email FROM users WHERE id = ?', [parseInt(userId)]);
      if (user) {
        await resend.emails.send({
          from: 'GrowthEasy AI <no-reply@growtheasy.ai>',
          to: user.email,
          subject: 'Welcome to GrowthEasy AI — Access Activated!',
          html: `
            <html>
              <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #00ff00; box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);">
                  <h1 style="text-align: center; color: #00ff00; font-size: 36px; text-shadow: 0 0 15px #00ff00;">
                    Welcome to GrowthEasy AI!
                  </h1>
                  <p style="font-size: 20px; line-height: 1.6; text-align: center;">
                    Your payment was successful.<br>
                    You now have <strong>${newStatus === 'lifetime' ? 'lifetime' : 'full'} access</strong>.
                  </p>
                  <div style="text-align: center; margin: 50px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="display: inline-block; background: #00ff00; color: #000; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #00ff00;">
                      Go to Dashboard
                    </a>
                  </div>
                  <p style="font-size: 16px; color: #a0efa0; text-align: center;">
                    Start connecting your stores and asking the AI Growth Coach anything.
                  </p>
                  <hr style="border-color: #00ff0040; margin: 50px 0;">
                  <p style="text-align: center; color: #66cc66; font-size: 14px;">
                    — GrowthEasy AI Team
                  </p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Welcome email sent to user ${userId}`);
      }
    } catch (emailError: any) {
      console.error('Failed to send welcome email:', emailError.message);
      // Don't fail webhook — email is non-critical
    }
  }

  return NextResponse.json({ received: true });
}