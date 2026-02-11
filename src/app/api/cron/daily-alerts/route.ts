import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import AlertEmail from '@/app/emails/AlertEmail';
import { Resend } from 'resend';

const testUsers = [
  {
    id: 1,
    email: 'your-real-email@example.com', // ← change to your email
    name: 'Test User',
  },
];

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET() {
  console.log('[CRON-DAILY] Starting daily alerts job');

  try {
    for (const user of testUsers) {
      // TEMPORARY fake metric check – replace with real logic later
      const todayChurn = 12.4;
      const yesterdayChurn = 10.1;
      const churnChange = ((todayChurn - yesterdayChurn) / yesterdayChurn) * 100;

      // Alert if churn increased more than 10%
      if (churnChange > 10) {
        const html = render(
          <AlertEmail
            name={user.name}
            metricName="Churn Rate"
            change={churnChange}
            currentValue={todayChurn}
            previousValue={yesterdayChurn}
            dashboardUrl={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/churn`}
          />
        );

        const { error } = await resend.emails.send({
          from: 'GrowthEasy AI <alerts@growtheasy.ai>',
          to: user.email,
          subject: `Alert: Churn Rate Increased ${churnChange.toFixed(1)}%`,
          html,
        });

        if (error) {
          console.error(`Daily alert failed for ${user.email}:`, error);
        } else {
          console.log(`Daily alert sent successfully to ${user.email}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[CRON-DAILY] Failed:', err);
    return NextResponse.json({ error: 'Failed to send alerts' }, { status: 500 });
  }
}