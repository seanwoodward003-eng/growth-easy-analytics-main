import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import WeeklyReport from '@/app/emails/WeeklyReport';
import { Resend } from 'resend';

// TEMPORARY – replace with real DB query later
const testUsers = [
  {
    id: 1,
    email: 'your-real-email@example.com', // ← change this to your email for testing
    name: 'Test User',
  },
  // Add more test emails if you want
];

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET() {
  console.log('[CRON-WEEKLY] Starting weekly reports job');

  try {
    for (const user of testUsers) {
      // TEMPORARY fake metrics – replace with real data later
      const metrics = {
        churnChange: 3.8,
        mrrChange: -2.1,
        newCustomers: 14,
      };

      const html = render(
        <WeeklyReport
          name={user.name}
          churnChange={metrics.churnChange}
          mrrChange={metrics.mrrChange}
          newCustomers={metrics.newCustomers}
          dashboardUrl={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        />
      );

      const { error } = await resend.emails.send({
        from: 'GrowthEasy AI <reports@growtheasy.ai>',
        to: user.email,
        subject: 'Your Weekly Growth Report',
        html,
      });

      if (error) {
        console.error(`Weekly report failed for ${user.email}:`, error);
      } else {
        console.log(`Weekly report sent successfully to ${user.email}`);
      }
    }

    return NextResponse.json({ success: true, sent: testUsers.length });
  } catch (err) {
    console.error('[CRON-WEEKLY] Failed:', err);
    return NextResponse.json({ error: 'Failed to send reports' }, { status: 500 });
  }
}