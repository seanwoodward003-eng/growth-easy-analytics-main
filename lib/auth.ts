// lib/auth.ts — updated version (copy-paste this over your current one)

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { getRow } from './db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export interface AuthUser {
  id: number;
  email: string;
}

export function generateTokens(userId: number, email: string) {
  const access = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '30d' });
  return { access, refresh };
}

export function generateCsrfToken() {
  return randomBytes(32).toString('hex');
}

export async function setAuthCookies(access: string, refresh: string, csrf: string) {
  const cookieStore = cookies(); // No need for await in App Router server components/actions

  cookieStore.set('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
    sameSite: 'lax', // Changed from 'none' → 'lax' is safer and works better with redirects
    path: '/',
    maxAge: 3600, // 1 hour
  });

  cookieStore.set('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  cookieStore.set('csrf_token', csrf, {
    httpOnly: false, // Must be readable by client JS for X-CSRF-Token header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return null;

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as { sub: string; email: string };
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}

// Reusable for API routes and server actions
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized', status: 401 };

  const row = await getRow<{ trial_end: string; subscription_status: string }>(
    'SELECT trial_end, subscription_status FROM users WHERE id = ?',
    [user.id]
  );

  if (!row) return { error: 'User not found', status: 404 };

  if (row.subscription_status === 'trial' && new Date() > new Date(row.trial_end)) {
    return { error: 'trial_expired', status: 403 };
  }
  if (row.subscription_status === 'canceled') {
    return { error: 'subscription_canceled', status: 403 };
  }

  return { user, row }; // Return more data if needed
}

export async function verifyCSRF(request: Request): Promise<boolean> {
  const cookieStore = cookies();
  const cookieCsrf = cookieStore.get('csrf_token')?.value;
  const headerCsrf = request.headers.get('X-CSRF-Token');

  return !!cookieCsrf && !!headerCsrf && cookieCsrf === headerCsrf;
}