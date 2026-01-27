import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth'; // adjust path to your auth file
import { getRow, getRows } from '@/lib/db'; // adjust if your DB helpers are named differently

export async function GET(request: Request) {
  try {
    // Auth check using your existing function
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;

    // Fetch user's main data (expand this with whatever you want to export)
    const userData = await getRow(
      'SELECT id, email, created_at, trial_end, subscription_status FROM users WHERE id = ?',
      [user.id]
    );

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optional: add more tables/data (e.g. metrics, integrations, logs)
    // Example: fetch all revenue/churn metrics for this user
    const metricsData = await getRows(
      'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 100',
      [user.id]
    );

    // Build the full export object
    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        createdAt: userData.created_at,
        trialEnd: userData.trial_end,
        subscriptionStatus: userData.subscription_status,
        // Add shopify/ga4/hubspot if you want
      },
      metrics: metricsData || [], // your actual data rows
      exportedAt: new Date().toISOString(),
    };

    // Return as JSON download
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