import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getRow } from './db';
import { decrypt } from '@/lib/encryption';
import { NextRequest } from 'next/server';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SECRET_KEY!
);
const REFRESH_SECRET_KEY = new TextEncoder().encode(process.env.REFRESH_SECRET!);

export interface AuthUser {
  id: number;
  email: string;
  shopify_shop?: string | null;
  shopify_access_token?: string | null;
  ga4_connected?: boolean | null;
  hubspot_connected?: boolean | null;
}

export type AuthResult =
  | { success: true; user: AuthUser & { trial_end?: string; subscription_status?: string }; shopDomain: string | null }
  | { success: false; error: string; status: number };

// ────────────────────────────────────────────────
// NEW: Unified auth for embedded + legacy cookie flows
// ────────────────────────────────────────────────
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');

  // ── Primary path: Shopify embedded app session token (Bearer JWT) ──
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('[AUTH] authenticateRequest → attempting Shopify session token validation');

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SHOPIFY_API_SECRET!),
        { algorithms: ['HS256'] }
      );

      if (payload.aud !== process.env.SHOPIFY_API_KEY) {
        console.log('[AUTH] Invalid audience in Shopify session token');
        return { success: false, error: 'Invalid token audience', status: 401 };
      }

      const shopDomain =
        (payload.dest as string)?.replace('https://', '') ||
        (payload.iss as string)?.replace('https://', '') ||
        null;

      if (!shopDomain) {
        console.log('[AUTH] Missing shop domain in Shopify session token');
        return { success: false, error: 'Missing shop domain in token', status: 401 };
      }

      console.log('[AUTH] Shopify session token valid — shop domain:', shopDomain);

      const row = await getRow<{
        id: number;
        email: string;
        shopify_shop: string | null;
        shopify_access_token: string | null;
        ga4_connected: boolean | null;
        hubspot_connected: boolean | null;
        trial_end: string | null;
        subscription_status: string | null;
      }>(
        'SELECT id, email, shopify_shop, shopify_access_token, ga4_connected, hubspot_connected, trial_end, subscription_status FROM users WHERE shopify_shop = ? LIMIT 1',
        [shopDomain]
      );

      if (!row) {
        console.log('[AUTH] No user found for shop domain:', shopDomain);
        return { success: false, error: 'User not found for shop', status: 404 };
      }

      let decryptedShopifyToken: string | null = null;
      if (row.shopify_access_token) {
        try {
          decryptedShopifyToken = await decrypt(row.shopify_access_token);
        } catch (err) {
          console.error('[AUTH] Decryption failed for shopify_access_token:', err);
        }
      }

      const user: AuthUser & { trial_end?: string; subscription_status?: string } = {
        id: row.id,
        email: row.email,
        shopify_shop: row.shopify_shop,
        shopify_access_token: decryptedShopifyToken,
        ga4_connected: row.ga4_connected,
        hubspot_connected: row.hubspot_connected,
        trial_end: row.trial_end ?? undefined,
        subscription_status: row.subscription_status ?? undefined,
      };

      // Basic subscription/trial check (mirroring requireAuth logic)
      const now = new Date();
      const trialEnd = row.trial_end ? new Date(row.trial_end) : null;

      if (row.subscription_status === 'trial' && trialEnd && now > trialEnd) {
        return { success: false, error: 'trial_expired', status: 403 };
      }

      if (row.subscription_status === 'canceled') {
        return { success: false, error: 'subscription_canceled', status: 403 };
      }

      return { success: true, user, shopDomain };
    } catch (err) {
      console.error('[AUTH] Shopify session token verification failed:', err);
      return { success: false, error: 'Invalid or expired session token', status: 401 };
    }
  }

  // ── Fallback: legacy cookie-based auth ──
  console.log('[AUTH] authenticateRequest → falling back to cookie/session auth');
  const legacyResult = await requireAuth();

  if ('error' in legacyResult) {
    // We know error is present when 'error' in legacyResult
    const error = legacyResult.error!;                    // non-null assertion
    const status = legacyResult.status ?? 401;            // safe default
    return { success: false, error, status };
  }

  return {
    success: true,
    user: legacyResult.user,
    shopDomain: null,
  };
}

// ────────────────────────────────────────────────
// Your original functions (unchanged)
// ────────────────────────────────────────────────

export async function generateTokens(userId: number, email: string) {
  const access = await new SignJWT({ sub: userId.toString(), email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET_KEY);

  const refresh = await new SignJWT({ sub: userId.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(REFRESH_SECRET_KEY);

  return { access, refresh };
}

export function generateCsrfToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function setAuthCookies(access: string, refresh: string, csrf: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  console.log('[AUTH] Setting cookies — access_token length:', access.length);

  cookieStore.set('access_token', access, {
    ...baseOptions,
    maxAge: 60 * 60 * 1, // 1 hour
  });

  cookieStore.set('refresh_token', refresh, {
    ...baseOptions,
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  cookieStore.set('csrf_token', csrf, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });

  console.log('[AUTH] Cookies set with sameSite=lax, secure=' + isProd);
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
    const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);

    if (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string'
    ) {
      const userId = parseInt(payload.sub, 10);
      if (isNaN(userId)) {
        console.log('[AUTH] getCurrentUser → invalid sub value');
        return null;
      }

      console.log('[AUTH] getCurrentUser → valid token, user id:', userId);
      return {
        id: userId,
        email: payload.email,
      };
    }

    console.log('[AUTH] getCurrentUser → payload shape invalid');
    return null;
  } catch (error) {
    console.log('[AUTH] getCurrentUser → token verification failed:', (error as Error).message);
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

  const now = new Date();
  const trialEnd = row.trial_end ? new Date(row.trial_end) : null;

  if (row.subscription_status === 'trial' && trialEnd && now > trialEnd) {
    console.log('[AUTH] requireAuth → trial expired');
    return { error: 'trial_expired', status: 403 };
  }

  if (row.subscription_status === 'canceled') {
    console.log('[AUTH] requireAuth → subscription canceled');
    return { error: 'subscription_canceled', status: 403 };
  }

  let decryptedShopifyToken: string | null = null;
  if (row.shopify_access_token) {
    try {
      decryptedShopifyToken = await decrypt(row.shopify_access_token);
      console.log('[AUTH] requireAuth → shopify_access_token decrypted successfully');
    } catch (err) {
      console.error('[AUTH] requireAuth → decryption failed for shopify_access_token:', err);
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

export async function verifyRefreshToken(token: string): Promise<{ sub: number } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET_KEY);

    if (typeof payload.sub === 'string') {
      const userId = parseInt(payload.sub, 10);
      if (!isNaN(userId)) {
        return { sub: userId };
      }
    }

    return null;
  } catch {
    return null;
  }
}


