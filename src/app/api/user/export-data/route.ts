import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth'; // adjust path if needed
import { getRow, getRows } from '@/lib/db'; // adjust if needed

export async function GET(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // authResult is already the AuthUser object
    const user = authResult;

    // Fetch user's main data (expand this with your actual tables)
    const userData = await getRow(
      'SELECT id, email, created_at, trial_end, subscription_status FROM users WHERE id = ?',
      [user.id]
    );

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Example: add more data (your metrics, etc.)
    const metricsData = await getRows(
      'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 100',
      [user.id]
    );

    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        createdAt: userData.created_at,
        trialEnd: userData.trial_end,
        subscriptionStatus: userData.subscription_status,
      },
      metrics: metricsData || [],
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=growth-easy-data.json',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Server error during export' }, { status: 500 });
  }
}