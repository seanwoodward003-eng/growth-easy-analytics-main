import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getRow } from '@/lib/db';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SECRET_KEY!
);

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_FRONTEND_URL!,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

export async function middleware(request: NextRequest) {
  console.log('[Middleware DEBUG] Middleware invoked - path:', request.nextUrl.pathname);
  console.log('[Middleware DEBUG] Request method:', request.method);

  const origin = request.headers.get('origin');
  console.log('[Middleware DEBUG] Origin header:', origin || 'none');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  console.log('[Middleware DEBUG] Is origin allowed?', isAllowedOrigin);

  let response = NextResponse.next();

  // Security headers (applied to everything)
  console.log('[Middleware DEBUG] Setting security headers');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // ────────────────────────────────────────────────────────────────
  // CSP COMMENTED OUT FOR TESTING — re-enable once Stripe works
  // ────────────────────────────────────────────────────────────────
  /*
  console.log('[Middleware DEBUG] Setting CSP header');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://js.stripe.com https://*.stripe.com https://checkout.stripe.com; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob: https://js.stripe.com https://*.stripe.com https://checkout.stripe.com; " +
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://checkout.stripe.com; " +
    "frame-src 'self' https://js.stripe.com https://*.stripe.com https://checkout.stripe.com; " +
    "img-src 'self' data: blob: https://*.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:"
  );
  */

  // ────────────────────────────────────────────────────────────────
  // FULL CORS HANDLING FOR ALL /api/* ROUTES
  // ────────────────────────────────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('[Middleware DEBUG] API route detected - handling CORS');

    // Allow origin if whitelisted, fallback to * for testing
    if (origin && isAllowedOrigin) {
      console.log('[Middleware DEBUG] Allowing specific origin:', origin);
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      console.log('[Middleware DEBUG] Allowing all origins (testing)');
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    // Handle preflight OPTIONS request (critical for POST with credentials)
    if (request.method === 'OPTIONS') {
      console.log('[Middleware DEBUG] Handling OPTIONS preflight - returning 204');
      return new Response(null, {
        status: 204,
        headers: response.headers,
      });
    }
  }

  // HTTPS redirect in production
  if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') {
    console.log('[Middleware DEBUG] HTTP in production - redirecting to HTTPS');
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Dashboard auth
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('[Middleware DEBUG] Dashboard route - checking authentication');
    const accessToken = request.cookies.get('access_token')?.value;
    console.log('[Middleware DEBUG] Access token cookie exists?', !!accessToken);

    if (!accessToken) {
      console.log('[Middleware DEBUG] No access token - redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    try {
      console.log('[Middleware DEBUG] Verifying JWT');
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);
      const userId = parseInt(payload.sub as string, 10);
      console.log('[Middleware DEBUG] JWT verified - userId:', userId);

      console.log('[Middleware DEBUG] Fetching user from DB');
      const user = await getRow<{ trial_end: string | null; subscription_status: string }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        console.log('[Middleware DEBUG] User not found in DB - redirecting');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      console.log('[Middleware DEBUG] User found - setting headers');
      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');
    } catch (err) {
      console.error('[Middleware DEBUG] JWT or DB error - redirecting to login');
      console.error('[Middleware DEBUG] Error:', err);

      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'session_expired');

      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.cookies.delete('access_token');
      redirectResponse.cookies.delete('refresh_token');
      redirectResponse.cookies.delete('csrf_token');
      return redirectResponse;
    }
  }

  console.log('[Middleware DEBUG] Middleware complete - passing through');
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',  // ← Added this so OPTIONS and CORS apply to all API routes
  ],
};