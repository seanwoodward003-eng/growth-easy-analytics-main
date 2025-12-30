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

export async function query(sql: string, args: any[] = []) {
  const c = getClient();
  const result = await c.execute({ sql, args });
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

// Schema initialization + rate_limits table
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
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          endpoint TEXT,
          timestamp TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
      args: [],
    },
    { sql: 'CREATE INDEX IF NOT EXISTS idx_metrics_user ON metrics(user_id);', args: [] },
    { sql: 'CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);', args: [] },
  ], 'write');

  // Safe column additions
  const info = await c.execute('PRAGMA table_info(users)');
  const columns = info.rows.map((r: any) => r.name);

  const additions = [
    { name: 'hubspot_refresh_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_refresh_token TEXT' },
    { name: 'shopify_access_token', sql: 'ALTER TABLE users ADD COLUMN shopify_access_token TEXT' },
    { name: 'gdpr_consented', sql: 'ALTER TABLE users ADD COLUMN gdpr_consented INTEGER DEFAULT 0' },
    { name: 'ga4_last_refreshed', sql: 'ALTER TABLE users ADD COLUMN ga4_last_refreshed TEXT' },
    { name: 'hubspot_access_token', sql: 'ALTER TABLE users ADD COLUMN hubspot_access_token TEXT' },
    { name: 'trial_end', sql: 'ALTER TABLE users ADD COLUMN trial_end TEXT' },
    { name: 'subscription_status', sql: "ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'trial'" },
  ];

  for (const { name, sql } of additions) {
    if (!columns.includes(name)) {
      await c.execute(sql);
    }
  }

  dbInitialized = true;
}

// Auto-init on first query
const originalQuery = query;
export const query = async (sql: string, args: any[] = []) => {
  await ensureDbInitialized();
  return originalQuery(sql, args);
};

const originalGetRow = getRow;
export const getRow = async <T = any>(sql: string, args: any[] = []): Promise<T | null> => {
  await ensureDbInitialized();
  return originalGetRow(sql, args);
};

const originalGetRows = getRows;
export const getRows = async <T = any>(sql: string, args: any[] = []): Promise<T[]> => {
  await ensureDbInitialized();
  return originalGetRows(sql, args);
};

const originalRun = run;
export const run = async (sql: string, args: any[] = []) => {
  await ensureDbInitialized();
  return originalRun(sql, args);
}; 