// lib/db.ts
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function query(sql: string, args: any[] = []) {
  const result = await client.execute({ sql, args });
  return result;
}

export async function getRow<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const result = await query(sql, args);
  return result.rows[0] ? (result.rows[0] as T) : null;
}

export async function getRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await query(sql, args);
  return result.rows as T[];
}

export async function run(sql: string, args: any[] = []) {
  await query(sql, args);
}

// Initialize schema and migrations
export async function initDb() {
  await client.batch([
    {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          stripe_id TEXT,
          shopify_shop TEXT,
          ga4_connected INTEGER DEFAULT 0,
          hubspot_connected INTEGER DEFAULT 0,
          ga4_access_token TEXT,
          ga4_refresh_token TEXT,
          ga4_property_id TEXT,
          shopify_access_token TEXT,
          hubspot_refresh_token TEXT,
          hubspot_access_token TEXT,
          gdpr_consented INTEGER DEFAULT 0,
          ga4_last_refreshed TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          trial_end TEXT,
          subscription_status TEXT DEFAULT 'trial'
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          date TEXT DEFAULT (datetime('now')),
          revenue REAL DEFAULT 0,
          churn_rate REAL DEFAULT 0,
          at_risk INTEGER DEFAULT 0,
          ltv REAL DEFAULT 0,
          cac REAL DEFAULT 0,
          top_channel TEXT DEFAULT '',
          acquisition_cost REAL DEFAULT 0,
          retention_rate REAL DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    { sql: 'CREATE INDEX IF NOT EXISTS idx_metrics_user ON metrics(user_id);', args: [] },
  ]);

  const info = await client.execute('PRAGMA table_info(users)');
  const columns = info.rows.map((r: any) => r.name);

  const columnAdditions = [
    { name: 'hubspot_refresh_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_refresh_token TEXT' },
    { name: 'shopify_access_token', sql: 'ALTER TABLE users ADD COLUMN shopify_access_token TEXT' },
    { name: 'gdpr_consented', sql: 'ALTER TABLE users ADD COLUMN gdpr_consented INTEGER DEFAULT 0' },
    { name: 'ga4_last_refreshed', sql: 'ALTER TABLE users ADD COLUMN ga4_last_refreshed TEXT' },
    { name: 'hubspot_access_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_access_token TEXT' },
    { name: 'trial_end', sql: 'ALTER TABLE users ADD COLUMN trial_end TEXT' },
    { name: 'subscription_status', sql: "ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'trial'" },
  ];

  for (const { name, sql } of columnAdditions) {
    if (!columns.includes(name)) {
      await client.execute(sql);
    }
  }
}

initDb().catch(err => console.error('DB init failed:', err));