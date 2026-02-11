import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/src/db/schema";

// Lazy-loaded client
let client: Client | null = null;

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables");
  }

  if (!client) {
    client = createClient({
      url,
      authToken: token,
    });
  }

  return client;
}

// Drizzle instance
export const db = drizzle(getClient(), { schema });

// ────────────────────────────────────────────────────────────────
// SECURITY: Row-Level Security (RLS) Wrapper
// Forces every query to filter by current authenticated user ID
// Prevents data leaks across users
// ────────────────────────────────────────────────────────────────

import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth"; // ← using your own auth

// Helper to get current user ID from session
async function getCurrentUserId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: No user session");
  }

  return user.id; // already a number
}

// Safe query wrapper – use this instead of raw db.query/db.select
// Automatically adds WHERE user_id = currentUserId to queries on user-owned tables
export async function safeQuery<T>(
  table: any,
  callback: (qb: any, userId: number) => any
): Promise<T[]> {
  const userId = await getCurrentUserId();

  const qb = db.select().from(table).where(eq(table.userId, userId));

  const finalQuery = callback(qb, userId);

  return finalQuery;
}

// ────────────────────────────────────────────────────────────────
// Keep your existing raw helpers (for backward compatibility)
// But prefer safeQuery for new code
// ────────────────────────────────────────────────────────────────

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

// Auto-init missing columns
let initialized = false;

async function initMissingColumns() {
  if (initialized) return;

  const c = getClient();

  const userInfo = await c.execute('PRAGMA table_info(users)');
  const userColumns = userInfo.rows.map((r: any) => r.name);

  const requiredColumns = [
    { name: 'verification_token', sql: 'ALTER TABLE users ADD COLUMN verification_token TEXT' },
    { name: 'verification_token_expires', sql: 'ALTER TABLE users ADD COLUMN verification_token_expires TEXT' },
    { name: 'marketing_consented', sql: 'ALTER TABLE users ADD COLUMN marketing_consented INTEGER DEFAULT 0' },
  ];

  for (const { name, sql } of requiredColumns) {
    if (!userColumns.includes(name)) {
      await c.execute(sql);
      console.log(`[DB Auto-Init] Added missing column: ${name}`);
    }
  }

  initialized = true;
}

// Exported safe helpers
export async function query(sql: string, args: any[] = []) {
  await initMissingColumns();
  return baseQuery(sql, args);
}

export async function getRow<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  await initMissingColumns();
  return baseGetRow(sql, args);
}

export async function getRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  await initMissingColumns();
  return baseGetRows(sql, args);
}

export async function run(sql: string, args: any[] = []) {
  await initMissingColumns();
  return baseRun(sql, args);
}

export async function batch(statements: { sql: string; args: any[] }[]) {
  await initMissingColumns();
  await getClient().batch(statements, "write");
}

// Re-export schema tables (corrected – only real exports)
export {
  users,
  orders,
  metrics,
  rateLimits,
  metricsHistory,
} from "@/src/db/schema";

// ────────────────────────────────────────────────────────────────
// ADDED: Export the 4 functions the cron routes need
// If they are defined in this file, add 'export' to their definitions instead
// If they are in another file, re-export them here with the correct path
// ────────────────────────────────────────────────────────────────

export {
  getUsersForAlerts,
  getDailyMetricsForAlert,
  getUsersForWeeklyReports,
  getWeeklyMetricsForUser
} from './db/cron-queries';  // ← CHANGE THIS PATH to the real location (e.g. './queries' or './cron')