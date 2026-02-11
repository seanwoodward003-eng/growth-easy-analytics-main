import { getRows, getRow } from '@/lib/db'; // import your own helpers

export async function getUsersForAlerts() {
  return getRows(`
    SELECT id, name, email
    FROM users
    WHERE subscription_status = 'active'  -- or whatever condition you use for alerts
    AND receive_alerts = 1
  `);
}

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