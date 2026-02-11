import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email_alerts_enabled, weekly_reports_enabled } = body;

    await run(
      `UPDATE users 
       SET 
         email_alerts_enabled = COALESCE(?, email_alerts_enabled),
         weekly_reports_enabled = COALESCE(?, weekly_reports_enabled)
       WHERE id = ?`,
      [
        email_alerts_enabled,
        weekly_reports_enabled,
        user.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update prefs failed:', err);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}