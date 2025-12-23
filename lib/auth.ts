// lib/auth.ts
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

export async function setAuthCookies(access: string, refresh: string, csrf: string) {
  const cookieStore = await cookies();  // ← await here
  cookieStore.set('access_token', access, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 3600,
  });
  cookieStore.set('refresh_token', refresh, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  cookieStore.set('csrf_token', csrf, {
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();  // ← await here
  const accessToken = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
  if (!accessToken) return null;

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as any;
    return { id: Number(payload.sub), email: payload.email || '' };
  } catch {
    return null;
  }
}

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

  return user;
}

export async function verifyCSRF(request: Request): Promise<boolean> {
  const cookieStore = await cookies();  // ← await here
  const cookie = cookieStore.get('csrf_token')?.value;
  const header = request.headers.get('X-CSRF-Token');

  // Fixed: explicitly return a boolean
  return !!cookie && !!header && cookie === header;
}