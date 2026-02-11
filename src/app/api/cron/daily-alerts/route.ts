import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import AlertEmail from '@/app/emails/AlertEmail';
import { Resend } from 'resend';
import { getUsersForAlerts, getDailyMetricsForAlert } from '@/lib/db';
import { getGrokInsight } from '@/lib/ai';

const resend = new Resend(process.env.RESEND_API_KEY!);

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

        // FIXED: assign JSX to variable first
        const alertElement = (
          <AlertEmail
            name={user.name || 'there'}
            metricName="Churn Rate"
            change={metrics.churnChange}
            currentValue={metrics.currentChurn || 0}
            previousValue={metrics.previousChurn || 0}
            aiInsight={aiInsight}
            dashboardUrl={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/churn`}
          />
        );

        const html = render(alertElement);

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