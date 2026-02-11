import { getRows, getRow } from '@/lib/db';

// Users who should receive daily churn alerts
export async function getUsersForAlerts() {
  return getRows(`
    SELECT id, name, email
    FROM users
    WHERE subscription_status = 'active' 
      AND receive_alerts = 1  -- adjust column/condition if needed
  `);
}

// Daily churn metrics for a specific user (latest day)
export async function getDailyMetricsForAlert(userId: number) {
  return getRow(`
    SELECT 
      churn_change,
      current_churn,
      previous_churn
    FROM metrics
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT 1
  `, [userId]);
}

// Users who should receive weekly reports
export async function getUsersForWeeklyReports() {
  return getRows(`
    SELECT id, name, email
    FROM users
    WHERE subscription_status = 'active' 
      AND receive_weekly_report = 1  -- adjust column/condition if needed
  `);
}

// Weekly metrics for a specific user (latest week)
export async function getWeeklyMetricsForUser(userId: number) {
  return getRow(`
    SELECT 
      churn_change,
      mrr_change,
      new_customers
    FROM weekly_metrics  -- adjust table name if different
    WHERE user_id = ?
    ORDER BY week DESC
    LIMIT 1
  `, [userId]);
}