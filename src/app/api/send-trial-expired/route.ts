// app/api/send-trial-expired/route.ts
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
      from: 'GrowthEasy AI <noreply@resend.dev>',
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
                   style="display: inline-block; background: #ff4444; color: #fff; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #ff4444;">
                  Upgrade & Regain Access
                </a>
              </div>
              <p style="font-size: 16px; color: #efa0a0; text-align: center;">
                Lifetime access still available — but spots are limited.
              </p>
              <hr style="border-color: #ff444440; margin: 50px 0;">
              <p style="text-align: center; color: #cc6666; font-size: 14px;">
                — GrowthEasy AI Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trial expired email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}