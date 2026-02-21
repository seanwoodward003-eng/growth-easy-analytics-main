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
  console.log('[MW DEBUG] === MIDDLEWARE STARTED ===');
  console.log('[MW DEBUG] Full URL:', request.url);
  console.log('[MW DEBUG] Path:', request.nextUrl.pathname);
  console.log('[MW DEBUG] Query params:', Object.fromEntries(request.nextUrl.searchParams.entries()));
  console.log('[MW DEBUG] Has embedded?', request.nextUrl.searchParams.has('embedded'));
  console.log('[MW DEBUG] Shop param:', request.nextUrl.searchParams.get('shop') || 'NONE');

  let response = NextResponse.next();

  // Global security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS for API routes
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

  // Detect embedded-like requests
  const isEmbeddedRequest =
    request.nextUrl.searchParams.has('embedded') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.size > 0) ||
    request.nextUrl.pathname === '';

  if (isEmbeddedRequest) {
    console.log('[MW DEBUG] Embedded request detected');

    // Bust cache for embedded loads (prevents stale 304/200 from old deploys)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Redirect embedded root / to /dashboard (preserves all query params)
    if (request.nextUrl.pathname === '/') {
      console.log('[MW DEBUG] Embedded root request - REDIRECTING to /dashboard with params');
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.search = request.nextUrl.search; // keep embedded=1, shop, id_token, hmac, etc.
      return NextResponse.redirect(dashboardUrl, 307); // 307 = temporary, preserves method/query
    }

    // Set Shopify-safe CSP (applies to /dashboard and other embedded HTML)
    const shop = request.nextUrl.searchParams.get('shop');

    let frameAncestors = "frame-ancestors 'self' https://admin.shopify.com https://*.shopify.com https://*.myshopify.com";
    if (shop && shop.endsWith('.myshopify.com')) {
      frameAncestors += ` https://${shop}`;
    }
    frameAncestors += "; ";

    const cspValue = 
      frameAncestors +
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com https://js.stripe.com https://*.stripe.com; " +
      "connect-src 'self' https://*.shopify.com https://*.myshopify.com https://api.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
      "child-src 'self' blob: https://js.stripe.com https://checkout.stripe.com; " +
      "img-src 'self' data: blob: https://cdn.shopify.com https://*.shopify.com https://*.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:; " +
      "base-uri 'self';";

    response.headers.set('Content-Security-Policy', cspValue);
    console.log('[MW DEBUG] CSP set for embedded request:', cspValue);

    // Auth check — if no token, BREAK OUT of iframe
    const accessToken = request.cookies.get('access_token')?.value;
    console.log('[MW DEBUG] Access token exists?', !!accessToken);

    if (!accessToken) {
      console.log('[MW DEBUG] No token in embedded context - sending breakout redirect');

      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'login_required');

      const breakoutHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirecting...</title>
        </head>
        <body>
          <p>Redirecting to login...</p>
          <script>
            const target = "${loginUrl.toString().replace(/"/g, '\\"')}";
            if (window.top && window.top !== window.self) {
              window.top.location.href = target;
            } else {
              window.location.href = target;
            }
          </script>
        </body>
        </html>
      `;

      const res = new NextResponse(breakoutHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          ...response.headers,
        },
      });

      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      res.cookies.delete('csrf_token');

      return res;
    }

    // Auth succeeds → proceed
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
        console.log('[MW DEBUG] No user - sending breakout redirect');
        const loginUrl = new URL('/', request.url);
        const breakoutHtml = `...`; // reuse breakoutHtml block from above
        const res = new NextResponse(breakoutHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html', ...response.headers },
        });
        res.cookies.delete('access_token');
        res.cookies.delete('refresh_token');
        res.cookies.delete('csrf_token');
        return res;
      }

      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[MW DEBUG] Auth error:', errorMessage);

      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      const breakoutHtml = `...`; // reuse
      const res = new NextResponse(breakoutHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...response.headers },
      });
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
    '/',                          // Explicit root
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};