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
  // Aggressive top-level logging to confirm run
  console.log('[MW DEBUG] === MIDDLEWARE STARTED ===');
  console.log('[MW DEBUG] Full request URL:', request.url);
  console.log('[MW DEBUG] Pathname:', request.nextUrl.pathname);
  console.log('[MW DEBUG] Query params:', Object.fromEntries(request.nextUrl.searchParams.entries()));
  console.log('[MW DEBUG] Method:', request.method);
  console.log('[MW DEBUG] x-forwarded-proto:', request.headers.get('x-forwarded-proto'));
  console.log('[MW DEBUG] Has embedded?', request.nextUrl.searchParams.has('embedded'));
  console.log('[MW DEBUG] Shop param:', request.nextUrl.searchParams.get('shop') || 'NONE');

  let response = NextResponse.next();

  // Global security headers (NO X-Frame-Options!)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // REMOVE HTTPS REDIRECT - Vercel handles it; this causes 308s
  // if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') { ... } // COMMENTED OUT

  // CORS for API routes (unchanged)
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('[MW DEBUG] API route - setting CORS');
    const origin = request.headers.get('origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    if (request.method === 'OPTIONS') {
      console.log('[MW DEBUG] OPTIONS preflight 204');
      return new Response(null, { status: 204, headers: response.headers });
    }
  }

  // Embedded check: Catch root with embedded param OR dashboard
  const isEmbeddedRequest =
    request.nextUrl.searchParams.has('embedded') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.size > 0) ||
    request.nextUrl.pathname === '';

  if (isEmbeddedRequest) {
    console.log('[MW DEBUG] Embedded request detected - running auth + CSP');

    const accessToken = request.cookies.get('access_token')?.value;
    console.log('[MW DEBUG] Access token cookie?', !!accessToken);

    if (!accessToken) {
      console.log('[MW DEBUG] No token - redirect to login');
      const url = request.nextUrl.clone();
      url.pathname = '/'; // or '/login'
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    try {
      console.log('[MW DEBUG] Verifying JWT');
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);
      const userId = parseInt(payload.sub as string, 10);
      console.log('[MW DEBUG] JWT OK - userId:', userId);

      console.log('[MW DEBUG] Fetching user from DB');
      const user = await getRow<{ trial_end: string | null; subscription_status: string }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        console.log('[MW DEBUG] No user - redirect');
        return NextResponse.redirect(new URL('/', request.url));
      }

      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');

      // CSP setup
      console.log('[MW DEBUG] Setting CSP');
      const shop = request.nextUrl.searchParams.get('shop');
      let frameAncestors = "frame-ancestors 'self' https://admin.shopify.com";
      if (shop && shop.endsWith('.myshopify.com')) {
        frameAncestors += ` https://${shop};`;
        console.log('[MW DEBUG] Added exact shop:', shop);
      } else {
        frameAncestors += ' https://*.myshopify.com;'; // safe fallback
        console.log('[MW DEBUG] No shop param - using wildcard fallback');
      }

      const cspValue = `${frameAncestors} ` +
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; " +
        "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
        "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
        "child-src 'self' blob: https://js.stripe.com https://checkout.stripe.com; " +
        "img-src 'self' data: blob: https://*.stripe.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:;";

      console.log('[MW DEBUG] CSP value:', cspValue);
      response.headers.set('Content-Security-Policy', cspValue);

    } catch (err) {
      console.error('[MW DEBUG] Auth/CSP error:', err.message);
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'session_expired');
      const res = NextResponse.redirect(url);
      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      res.cookies.delete('csrf_token');
      return res;
    }
  } else {
    console.log('[MW DEBUG] Not embedded-like - skipping CSP/auth');
  }

  console.log('[MW DEBUG] === MIDDLEWARE END ===');
  return response;
}

export const config = {
  matcher: [
    // Catch everything except static/assets (includes root + query params)
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
    '/dashboard/:path*',
    '/api/:path*',
  ],
};