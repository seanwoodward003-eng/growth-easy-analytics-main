import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getUsersForWeeklyReports, getWeeklyMetricsForUser } from '@/lib/db';
import { getGrokInsight } from '@/lib/ai';

const resend = new Resend(process.env.RESEND_API_KEY!);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON-WEEKLY] Starting weekly reports');

  try {
    const users = await getUsersForWeeklyReports();

    for (const user of users) {
      const metrics = await getWeeklyMetricsForUser(user.id);

      const prompt = `
        You are a concise e-commerce growth coach.
        Weekly data for this store:
        - Churn change: ${metrics.churnChange.toFixed(1)}%
        - MRR change: ${metrics.mrrChange.toFixed(1)}%
        - New customers: +${metrics.newCustomers}
        Provide 2-3 actionable growth insights in 60 words or less.
      `;

      const aiInsight = await getGrokInsight(prompt);

      const html = `
        <html>
          <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #ff00ff;">
              <h1 style="text-align: center; color: #ff00ff; font-size: 32px;">
                Your Weekly Growth Report
              </h1>
              <p style="font-size: 18px; line-height: 1.6; text-align: center;">
                Hi ${user.name || 'there'},<br>
                Here's a quick summary of your store's week.
              </p>
              <ul style="font-size: 16px; line-height: 1.8; color: #d8a0ef;">
                <li>Churn change: ${metrics.churnChange.toFixed(1)}%</li>
                <li>MRR change: ${metrics.mrrChange.toFixed(1)}%</li>
                <li>New customers: +${metrics.newCustomers}</li>
              </ul>
              <p style="font-size: 16px; color: #d8a0ef; text-align: center; margin: 30px 0;">
                ${aiInsight}
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${APP_URL}/dashboard" style="background: #ff00ff; color: #000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                  View Full Dashboard
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
        from: 'GrowthEasy AI <reports@growtheasy.ai>',
        to: user.email,
        subject: 'Your Weekly Growth Report',
        html,
      });

      if (error) {
        console.error(`Failed to send to ${user.email}:`, error);
      } else {
        console.log(`Weekly report sent to ${user.email}`);
      }
    }

    return NextResponse.json({ success: true, sent: users.length });
  } catch (err) {
    console.error('[CRON-WEEKLY] Failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}