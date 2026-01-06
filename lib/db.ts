// lib/db.ts
import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';

// Lazy-loaded client
let client: Client | null = null;

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
  }

  if (!client) {
    client = createClient({
      url,
      authToken: token,
    });
  }

  return client;
}

// Base functions (no init)
async function baseQuery(sql: string, args: any[] = []) {
  const c = getClient();
  const result = await c.execute({ sql, args });
  return result;
}

async function baseGetRow<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const result = await baseQuery(sql, args);
  return result.rows[0] ? (result.rows[0] as T) : null;
}

async function baseGetRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await baseQuery(sql, args);
  return result.rows as T[];
}

async function baseRun(sql: string, args: any[] = []) {
  await baseQuery(sql, args);
}

// Schema initialization + rate_limits table + metrics_history
let dbInitialized = false;

async function ensureDbInitialized() {
  if (dbInitialized) return;

  const c = getClient();

  await c.batch([
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
          aov REAL DEFAULT 0,
          repeat_rate REAL DEFAULT 0,
          ltv_new REAL DEFAULT 0,
          ltv_returning REAL DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          endpoint TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    // NEW: metrics_history for anomaly detection
    {
      sql: `
        CREATE TABLE IF NOT EXISTS metrics_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          sync_date TEXT,
          revenue REAL,
          churn_rate REAL,
          at_risk INTEGER,
          aov REAL,
          repeat_rate REAL,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    { sql: 'CREATE INDEX IF NOT EXISTS idx_metrics_user ON metrics(user_id);', args: [] },
    { sql: 'CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, timestamp);', args: [] },
  ], 'write');

  // Safe column additions for users
  const userInfo = await c.execute('PRAGMA table_info(users)');
  const userColumns = userInfo.rows.map((r: any) => r.name);

  const userAdditions = [
    { name: 'hubspot_refresh_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_refresh_token TEXT' },
    { name: 'shopify_access_token', sql: 'ALTER TABLE users ADD COLUMN shopify_access_token TEXT' },
    { name: 'gdpr_consented', sql: 'ALTER TABLE users ADD COLUMN gdpr_consented INTEGER DEFAULT 0' },
    { name: 'ga4_last_refreshed', sql: 'ALTER TABLE users ADD COLUMN ga4_last_refreshed TEXT' },
    { name: 'hubspot_access_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_access_token TEXT' },
    { name: 'trial_end', sql: 'ALTER TABLE users ADD COLUMN trial_end TEXT' },
    { name: 'subscription_status', sql: "ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'trial'" },
  ];

  for (const { name, sql } of userAdditions) {
    if (!userColumns.includes(name)) {
      await c.execute(sql);
    }
  }

  // Safe column additions for metrics (new analytics)
  const metricsInfo = await c.execute('PRAGMA table_info(metrics)');
  const metricsColumns = metricsInfo.rows.map((r: any) => r.name);

  const metricsAdditions = [
    { name: 'aov', sql: 'ALTER TABLE metrics ADD COLUMN aov REAL DEFAULT 0' },
    { name: 'repeat_rate', sql: 'ALTER TABLE metrics ADD COLUMN repeat_rate REAL DEFAULT 0' },
    { name: 'ltv_new', sql: 'ALTER TABLE metrics ADD COLUMN ltv_new REAL DEFAULT 0' },
    { name: 'ltv_returning', sql: 'ALTER TABLE metrics ADD COLUMN ltv_returning REAL DEFAULT 0' },
  ];

  for (const { name, sql } of metricsAdditions) {
    if (!metricsColumns.includes(name)) {
      await c.execute(sql);
    }
  }

  dbInitialized = true;
}

// Exported functions with auto-init
export async function query(sql: string, args: any[] = []) {
  await ensureDbInitialized();
  return baseQuery(sql, args);
}

export async function getRow<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  await ensureDbInitialized();
  return baseGetRow(sql, args);
}

export async function getRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  await ensureDbInitialized();
  return baseGetRows(sql, args);
}

export async function run(sql: string, args: any[] = []) {
  await ensureDbInitialized();
  return baseRun(sql, args);
}