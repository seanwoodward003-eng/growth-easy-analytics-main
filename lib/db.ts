// lib/db.ts
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/src/db/schema"; // ← adjust path if schema.ts is elsewhere (e.g. "@/lib/schema")

// Lazy-loaded client (kept from your code)
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

// Drizzle instance – now handles schema automatically
export const db = drizzle(getClient(), { schema });

// Base functions (bridged over Drizzle – your old code keeps working!)
async function baseQuery(sql: string, args: any[] = []) {
  const result = await db.execute({ sql, args });
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

// Exported functions – your app calls these (no changes needed!)
export async function query(sql: string, args: any[] = []) {
  return baseQuery(sql, args);
}

export async function getRow<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  return baseGetRow(sql, args);
}

export async function getRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  return baseGetRows(sql, args);
}

export async function run(sql: string, args: any[] = []) {
  return baseRun(sql, args);
}

// Optional: if you use batch somewhere, keep it
export async function batch(statements: { sql: string; args: any[] }[]) {
  await getClient().batch(statements, "write");
}