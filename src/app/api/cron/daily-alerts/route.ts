import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getUsersForAlerts, getDailyMetricsForAlert } from '@/lib/db';
import { getGrokInsight } from '@/lib/ai';

const resend = new Resend(process.env.RESEND_API_KEY!);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON-DAILY] Starting daily alerts');

  try {
    const users = await getUsersForAlerts();

    for (const user of users) {
      const metrics = await getDailyMetricsForAlert(user.id);

      if (metrics.churnChange > 10) {
        const prompt = `
          Churn increased ${metrics.churnChange.toFixed(1)}% today.
          Current: ${metrics.currentChurn.toFixed(1)}%, yesterday: ${metrics.previousChurn.toFixed(1)}%.
          Give 1-2 actionable steps to address this in 50 words or less.
        `;

        const aiInsight = await getGrokInsight(prompt);

        const html = `
          <html>
            <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #ff00ff;">
                <h1 style="text-align: center; color: #ff00ff; font-size: 32px;">
                  Alert: Churn Rate Increased ${metrics.churnChange.toFixed(1)}%
                </h1>
                <p style="font-size: 18px; line-height: 1.6; text-align: center;">
                  Hi ${user.name || 'there'},<br>
                  Churn jumped from ${metrics.previousChurn.toFixed(1)}% to ${metrics.currentChurn.toFixed(1)}% today.
                </p>
                <p style="font-size: 16px; color: #d8a0ef; text-align: center;">
                  ${aiInsight}
                </p>
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${APP_URL}/dashboard/churn" style="background: #ff00ff; color: #000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                    View Dashboard
                  </a>
                </div>
                <p style="text-align: center; font-size: 14px; color: #cc66cc;">
                  — GrowthEasy AI Team
                </p>
              </div>
            </body>
          </html>
        `;

        const { error } = await resend.emails.send({
          from: 'GrowthEasy AI <alerts@growtheasy.ai>',
          to: user.email,
          subject: `Alert: Churn Rate Increased ${metrics.churnChange.toFixed(1)}%`,
          html,
        });

        if (error) {
          console.error(`Alert failed for ${user.email}:`, error);
        } else {
          console.log(`Alert sent to ${user.email}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[CRON-DAILY] Error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}