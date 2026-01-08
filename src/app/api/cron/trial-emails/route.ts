// app/api/cron/trial-emails/route.ts
import { NextResponse } from 'next/server';
import { getRows } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET() {
  // Security: only Vercel cron can call this
  if (process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  try {
    const users = await getRows<{
      id: number;
      email: string;
      trial_end: string;
    }>(
      `SELECT id, email, trial_end FROM users WHERE subscription_status = 'trial' AND trial_end IS NOT NULL`
    );

    for (const user of users) {
      const trialEnd = new Date(user.trial_end);

      // Trial ending tomorrow → send reminder
      if (trialEnd >= tomorrow && trialEnd < dayAfter) {
        await resend.emails.send({
          from: 'GrowthEasy AI <no-reply@growtheasy.ai>',
          to: user.email,
          subject: '1 Day Left — Don\'t Lose Your GrowthEasy AI Access',
          html: `
            <html>
              <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #ff00ff; box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);">
                  <h1 style="text-align: center; color: #ff00ff; font-size: 36px; text-shadow: 0 0 15px #ff00ff;">
                    1 Day Left on Your Free Trial
                  </h1>
                  <p style="font-size: 20px; line-height: 1.6; text-align: center;">
                    Your 7-day free trial ends tomorrow.<br>
                    Don't lose access to your AI Growth Coach and real-time insights.
                  </p>
                  <div style="text-align: center; margin: 50px 0;">
                    <a href="${APP_URL}/pricing"
                       style="display: inline-block; background: #ff00ff; color: #000; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #ff00ff;">
                      Lock In Lifetime Access Now
                    </a>
                  </div>
                  <p style="font-size: 16px; color: #d8a0ef; text-align: center;">
                    Early bird £49 spots are running out fast.<br>
                    Upgrade today and never pay again.
                  </p>
                  <hr style="border-color: #ff00ff40; margin: 50px 0;">
                  <p style="text-align: center; color: #cc66cc; font-size: 14px;">
                    — GrowthEasy AI Team
                  </p>
                </div>
              </body>
            </html>
          `,
        });
      }

      // Trial already ended → send expired nudge
      if (trialEnd < now) {
        await resend.emails.send({
          from: 'GrowthEasy AI <no-reply@growtheasy.ai>',
          to: user.email,
          subject: 'Your Free Trial Has Ended — Come Back!',
          html: `
            <html>
              <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #ff4444; box-shadow: 0 0 30px rgba(255, 68, 68, 0.3);">
                  <h1 style="text-align: center; color: #ff4444; font-size: 36px; text-shadow: 0 0 15px #ff4444;">
                    Your Free Trial Has Ended
                  </h1>
                  <p style="font-size: 20px; line-height: 1.6; text-align: center;">
                    Your access to GrowthEasy AI has been paused.<br>
                    Your data is safe — upgrade to continue growing.
                  </p>
                  <div style="text-align: center; margin: 50px 0;">
                    <a href="${APP_URL}/pricing"
                       style="display: inline-block; background: #ff4444; color: #fff; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #ff4444;">
                      Upgrade & Regain Access
                    </a>
                  </div>
                  <p style="font-size: 16px; color: #efa0a0; text-align: center;">
                    Lifetime access still available — but spots are limited.
                  </p>
                </div>
              </body>
            </html>
          `,
        });
      }
    }

    return NextResponse.json({ success: true, checked: users.length });
  } catch (error) {
    console.error('Cron trial emails error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}