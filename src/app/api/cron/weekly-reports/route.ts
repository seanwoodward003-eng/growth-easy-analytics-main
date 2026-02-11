import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import WeeklyReport from '@/app/emails/WeeklyReport';
import { Resend } from 'resend';
import { getUsersForWeeklyReports, getWeeklyMetricsForUser } from '@/lib/db';
import { getGrokInsight } from '@/lib/ai';

const resend = new Resend(process.env.RESEND_API_KEY!);

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

      const html = render((
        <WeeklyReport
          name={user.name || 'there'}
          churnChange={metrics.churnChange || 0}
          mrrChange={metrics.mrrChange || 0}
          newCustomers={metrics.newCustomers || 0}
          aiInsight={aiInsight}
          dashboardUrl={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        />
      ));

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