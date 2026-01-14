// lib/db.ts
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/src/db/schema"; // adjust path if needed (e.g. "../src/db/schema")

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

// Drizzle instance – ready for typed queries
export const db = drizzle(getClient(), { schema });

// ────────────────────────────────────────────────────────────────
// Bridge: Re-implement your original raw helpers using the RAW client
// This ensures ALL your existing API routes continue working unchanged
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

// ────────────────────────────────────────────────────────────────
// AUTOMATIC SCHEMA FIX: Add missing columns on first query (permanent, automatic)
// ────────────────────────────────────────────────────────────────

let initialized = false;

async function initMissingColumns() {
  if (initialized) return;

  const c = getClient();

  // Get current columns in users table
  const userInfo = await c.execute('PRAGMA table_info(users)');
  const userColumns = userInfo.rows.map((r: any) => r.name);

  // List of columns that MUST exist (add new ones here in future)
  const requiredColumns = [
    { name: 'verification_token', sql: 'ALTER TABLE users ADD COLUMN verification_token TEXT' },
    { name: 'verification_token_expires', sql: 'ALTER TABLE users ADD COLUMN verification_token_expires TEXT' },
    // Example future: { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0' },
  ];

  for (const { name, sql } of requiredColumns) {
    if (!userColumns.includes(name)) {
      await c.execute(sql);
      console.log(`[DB Auto-Init] Added missing column: ${name}`);
    }
  }

  initialized = true;
}

// Exported functions – your app calls these (no changes needed in routes!)
// They now auto-init on first call
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

// Optional: Keep batch if you use it anywhere
export async function batch(statements: { sql: string; args: any[] }[]) {
  await initMissingColumns();
  await getClient().batch(statements, "write");
}

// ────────────────────────────────────────────────────────────────
// RE-EXPORT SCHEMA TABLES
// This allows you to do: import { db, users, orders } from '@/lib/db';
// ────────────────────────────────────────────────────────────────
export {
  users,
  orders,
  // Add any other tables here as you use them (e.g. customers, products, sessions...)
} from "@/src/db/schema";