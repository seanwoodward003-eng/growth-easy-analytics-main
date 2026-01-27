import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { getRow } from './db';
import { decrypt } from '@/lib/encryption';  // ← correct path now

// ← REMOVED: import { verifyCSRF } from '@/lib/auth';  (circular import – this was the only problem)

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export interface AuthUser {
  id: number;
  email: string;

  shopify_shop?: string | null;
  shopify_access_token?: string | null;
  ga4_connected?: boolean | null;
  hubspot_connected?: boolean | null;
}

export function generateTokens(userId: number, email: string) {
  const access = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '90d' });
  return { access, refresh };
}

export function generateCsrfToken() {
  return randomBytes(32).toString('hex');
}

export async function setAuthCookies(access: string, refresh: string, csrf: string) {
  const cookieStore = await cookies();

  console.log('[AUTH] Setting cookies — access_token length:', access.length);

  cookieStore.set('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1,
  });

  cookieStore.set('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });

  cookieStore.set('csrf_token', csrf, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.log('[AUTH] getCurrentUser → no access_token cookie');
    return null;
  }

  console.log('[AUTH] getCurrentUser → verifying access_token (length:', accessToken.length, ')');

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET);

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      typeof (payload as any).sub === 'number' &&
      'email' in payload &&
      typeof (payload as any).email === 'string'
    ) {
      console.log('[AUTH] getCurrentUser → valid token, user id:', (payload as any).sub);
      return {
        id: (payload as any).sub,
        email: (payload as any).email,
      };
    }

    console.log('[AUTH] getCurrentUser → payload invalid');
    return null;
  } catch (error) {
    console.log('[AUTH] getCurrentUser → token verification failed:', error);
    return null;
  }
}

export async function requireAuth() {
  console.log('[AUTH] requireAuth called');
  const user = await getCurrentUser();
  if (!user) {
    console.log('[AUTH] requireAuth → no user');
    return { error: 'Unauthorized', status: 401 };
  }

  console.log('[AUTH] requireAuth → loading full user row from DB for id:', user.id);

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

  if (!row) {
    console.log('[AUTH] requireAuth → user row not found in DB');
    return { error: 'User not found', status: 404 };
  }

  console.log('[AUTH] requireAuth → DB row loaded → shopify_shop:', row.shopify_shop || '(null)');
  console.log('[AUTH] requireAuth → shopify_access_token exists:', !!row.shopify_access_token);

  const now = new Date();
  const trialEnd = row.trial_end ? new Date(row.trial_end) : null;

  if (
    row.subscription_status === 'trial' &&
    trialEnd &&
    now > trialEnd
  ) {
    console.log('[AUTH] requireAuth → trial expired');
    return { error: 'trial_expired', status: 403 };
  }

  if (row.subscription_status === 'canceled') {
    console.log('[AUTH] requireAuth → subscription canceled');
    return { error: 'subscription_canceled', status: 403 };
  }

  // Decrypt Shopify access token if present
  let decryptedShopifyToken: string | null = null;
  if (row.shopify_access_token) {
    try {
      decryptedShopifyToken = decrypt(row.shopify_access_token);
      console.log('[AUTH] requireAuth → shopify_access_token decrypted successfully');
    } catch (err) {
      console.error('[AUTH] requireAuth → decryption failed for shopify_access_token:', err);
      decryptedShopifyToken = null;
    }
  }

  return {
    user: {
      ...user,
      shopify_shop: row.shopify_shop,
      shopify_access_token: decryptedShopifyToken,
      ga4_connected: row.ga4_connected,
      hubspot_connected: row.hubspot_connected,
    },
    subscription: {
      trial_end: row.trial_end,
      subscription_status: row.subscription_status,
    },
  };
}

export async function verifyCSRF(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieCsrf = cookieStore.get('csrf_token')?.value;
  const headerCsrf = request.headers.get('X-CSRF-Token');
  return !!cookieCsrf && !!headerCsrf && cookieCsrf === headerCsrf;
}

export function verifyRefreshToken(token: string): { sub: number } | null {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    if (typeof payload === 'object' && payload !== null && 'sub' in payload && typeof (payload as any).sub === 'number') {
      return { sub: (payload as any).sub };
    }
    return null;
  } catch {
    return null;
  }
}