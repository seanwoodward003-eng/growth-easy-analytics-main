import { getRows, getRow } from '@/lib/db';

export async function getUsersForWeeklyReports() {
  return getRows(`
    SELECT id, name, email
    FROM users
    WHERE subscription_status = 'active'  -- or your weekly report condition
    AND receive_weekly_report = 1
  `);
}

export async function getWeeklyMetricsForUser(userId: number) {
  return getRow(`
    SELECT 
      churn_change,
      mrr_change,
      new_customers
    FROM weekly_metrics  -- or your actual table name
    WHERE user_id = ?
    ORDER BY week DESC
    LIMIT 1
  `, [userId]);
}