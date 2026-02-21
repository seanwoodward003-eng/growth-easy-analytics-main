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
  console.log('[MW] === MIDDLEWARE START ===');
  console.log('[MW] URL:', request.url);
  console.log('[MW] Path:', request.nextUrl.pathname);
  console.log('[MW] Query:', Object.fromEntries(request.nextUrl.searchParams));
  console.log('[MW] Embedded param?', request.nextUrl.searchParams.has('embedded'));
  console.log('[MW] Shop param?', request.nextUrl.searchParams.get('shop') || 'missing');

  let response = NextResponse.next();

  // Security basics (always send)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Handle API CORS
  if (request.nextUrl.pathname.startsWith('/api')) {
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
      return new Response(null, { status: 204, headers: response.headers });
    }
  }

  // ────────────────────────────────────────────────
  // FORCE CORRECT FRAME-ANCESTORS ON ROOT PATH
  // This runs on / even if other conditions miss
  // ────────────────────────────────────────────────
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '') {
    const shop = request.nextUrl.searchParams.get('shop') || '';

    let frameAncestors = "frame-ancestors 'self' https://admin.shopify.com https://*.shopify.com https://*.myshopify.com";
    if (shop && shop.endsWith('.myshopify.com')) {
      frameAncestors += ` https://${shop}`;
    }
    frameAncestors += "; ";

    // Build full CSP – but make sure frame-ancestors comes first
    const csp = frameAncestors +
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com https://js.stripe.com; " +
      "connect-src 'self' https://*.shopify.com https://*.myshopify.com https://api.stripe.com https://checkout.stripe.com; " +
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com; " +
      "img-src 'self' data: blob: https://cdn.shopify.com https://*.shopify.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:;";

    response.headers.set('Content-Security-Policy', csp);
    console.log('[MW] FORCED CSP on root:', csp);

    // Kill all caching – Vercel/edge must not cache this
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Debug-Frame-Fix', 'forced-on-root');
  }

  // ────────────────────────────────────────────────
  // Your normal embedded logic (auth, redirect, etc.)
  // ────────────────────────────────────────────────
  const isEmbedded =
    request.nextUrl.searchParams.has('embedded') ||
    request.nextUrl.searchParams.has('shop') ||
    request.nextUrl.searchParams.has('hmac') ||
    request.nextUrl.pathname.startsWith('/dashboard');

  if (isEmbedded) {
    console.log('[MW] Embedded-like request');

    // Redirect root embedded → dashboard
    if (request.nextUrl.pathname === '/') {
      console.log('[MW] Redirecting embedded root → /dashboard');
      const dash = new URL('/dashboard', request.url);
      dash.search = request.nextUrl.search;
      return NextResponse.redirect(dash, 307);
    }

    // Rest of your auth logic...
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.log('[MW] No access token → breakout to login');
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'login_required');

      const html = `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Redirecting</title></head>
        <body>
          <p>Redirecting...</p>
          <script>
            const target = "${loginUrl.toString().replace(/"/g, '\\"')}";
            if (window.top) window.top.location = target;
            else window.location = target;
          </script>
        </body></html>
      `;

      const res = new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...response.headers }
      });
      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      return res;
    }

    // JWT + user check (keep your original code here)
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);
      const userId = parseInt(payload.sub as string, 10);

      const user = await getRow<{ trial_end: string | null; subscription_status: string }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (user) {
        response.headers.set('x-user-id', userId.toString());
        response.headers.set('x-subscription-status', user.subscription_status);
        response.headers.set('x-trial-end', user.trial_end || '');
      }
    } catch (err) {
      console.error('[MW] Auth failed:', err);
      // breakout redirect...
    }
  }

  console.log('[MW] === END ===');
  return response;
}

export const config = {
  matcher: [
    '/',                                // force on root
    '/((?!_next/static|_next/image|favicon.ico).*)',  // almost everything
  ],
};