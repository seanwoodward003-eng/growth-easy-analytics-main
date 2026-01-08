// app/api/send-trial-ending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getRow } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  const user = await getRow<{ email: string }>('SELECT email FROM users WHERE id = ?', [userId]);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}