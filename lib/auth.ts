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

  // Shopify integration fields
  shopify_shop?: string | null;
  shopify_access_token?: string | null;

  // GA4 integration fields (adjust names later if you use tokens instead)
  ga4_connected?: boolean | null;

  // HubSpot integration fields (adjust names later if you use tokens instead)
  hubspot_connected?: boolean | null;

  // You can add more fields here in the future if needed
}

export function generateTokens(userId: number, email: string) {
  const access = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '30d' });
  return { access, refresh };
}

export function generateCsrfToken() {
  return randomBytes(32).toString('hex');
}

// Make it async and await cookies()
export async function setAuthCookies(access: string, refresh: string, csrf: string) {
  const cookieStore = await cookies(); // ← MUST await in Next.js 15

  cookieStore.set('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
  });

  cookieStore.set('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  cookieStore.set('csrf_token', csrf, {
    httpOnly: false, // Frontend needs to read for CSRF header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

// Make async where needed
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return null;

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as { sub: string; email: string };
    
    // We only return basic fields here — extra DB fields are fetched in requireAuth if needed
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized', status: 401 };

  const row = await getRow<{
    trial_end: string;
    subscription_status: string;
    shopify_shop?: string | null;
    shopify_access_token?: string | null;
    ga4_connected?: boolean | null;
    hubspot_connected?: boolean | null;
  }>(
    'SELECT trial_end, subscription_status, shopify_shop, shopify_access_token, ga4_connected, hubspot_connected FROM users WHERE id = ?',
    [user.id]
  );

  if (!row) return { error: 'User not found', status: 404 };

  if (row.subscription_status === 'trial' && new Date() > new Date(row.trial_end)) {
    return { error: 'trial_expired', status: 403 };
  }
  if (row.subscription_status === 'canceled') {
    return { error: 'subscription_canceled', status: 403 };
  }

  // Merge the DB fields into the user object
  return {
    user: {
      ...user,
      shopify_shop: row.shopify_shop,
      shopify_access_token: row.shopify_access_token,
      ga4_connected: row.ga4_connected,
      hubspot_connected: row.hubspot_connected,
    },
    subscription: {
      trial_end: row.trial_end,
      subscription_status: row.subscription_status,
    },
  };
}

// Make async (returns Promise<boolean>)
export async function verifyCSRF(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieCsrf = cookieStore.get('csrf_token')?.value;
  const headerCsrf = request.headers.get('X-CSRF-Token');

  return !!cookieCsrf && !!headerCsrf && cookieCsrf === headerCsrf;
}