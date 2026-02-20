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
  // ── TOP-LEVEL DEBUG: Confirm middleware even runs ──
  console.log('[Middleware DEBUG] INVOKED for full URL:', request.url);
  console.log('[Middleware DEBUG] Pathname only:', request.nextUrl.pathname);
  console.log('[Middleware DEBUG] Query params object:', Object.fromEntries(request.nextUrl.searchParams.entries()));
  console.log('[Middleware DEBUG] Has embedded param?', request.nextUrl.searchParams.has('embedded'));
  console.log('[Middleware DEBUG] Shop param value:', request.nextUrl.searchParams.get('shop') || 'MISSING');

  const origin = request.headers.get('origin');
  console.log('[Middleware DEBUG] Origin:', origin || 'none');

  let response = NextResponse.next();

  // Global security headers
  console.log('[Middleware DEBUG] Setting global security headers');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Your CORS block for /api (unchanged)
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('[Middleware DEBUG] API route - handling CORS');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*'); // testing
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    if (request.method === 'OPTIONS') {
      console.log('[Middleware DEBUG] OPTIONS preflight - 204');
      return new Response(null, { status: 204, headers: response.headers });
    }
  }

  // HTTPS redirect (unchanged)
  if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') {
    console.log('[Middleware DEBUG] Redirecting HTTP to HTTPS');
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // ── Broader embedded check ──
  const isEmbeddedLike =
    request.nextUrl.searchParams.has('embedded') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '' ||
    request.nextUrl.pathname === '/index'; // add if you have /index

  if (isEmbeddedLike) {
    console.log('[Middleware DEBUG] Treating as potential embedded - starting auth + CSP');

    const accessToken = request.cookies.get('access_token')?.value;
    console.log('[Middleware DEBUG] Access token present?', !!accessToken);

    if (!accessToken) {
      console.log('[Middleware DEBUG] No token → redirect to login');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    try {
      console.log('[Middleware DEBUG] JWT verify start');
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);
      const userId = parseInt(payload.sub as string, 10);
      console.log('[Middleware DEBUG] JWT OK - userId:', userId);

      console.log('[Middleware DEBUG] DB lookup');
      const user = await getRow<{ trial_end: string | null; subscription_status: string }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        console.log('[Middleware DEBUG] No user in DB → redirect');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');

      // CSP logic
      console.log('[Middleware DEBUG] Building CSP');
      const shop = request.nextUrl.searchParams.get('shop');
      let shopDomain = '';
      if (shop && shop.endsWith('.myshopify.com')) {
        shopDomain = `https://${shop}`;
        console.log('[Middleware DEBUG] Shop valid:', shop);
      } else {
        console.warn('[Middleware DEBUG] Shop missing/invalid - fallback');
      }

      const frameAncestors = shopDomain
        ? `frame-ancestors 'self' https://admin.shopify.com ${shopDomain};`
        : "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com;";

      const stripeDirectives = [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com;",
        "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.stripe.com;",
        "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com;",
        "child-src 'self' blob: https://js.stripe.com https://checkout.stripe.com;",
        "img-src 'self' data: blob: https://*.stripe.com;",
        "style-src 'self' 'unsafe-inline';",
        "font-src 'self' data:;"
      ].join(' ');

      const fullCsp = frameAncestors + ' ' + stripeDirectives;
      console.log('[Middleware DEBUG] CSP final:', fullCsp);
      response.headers.set('Content-Security-Policy', fullCsp);

    } catch (err) {
      console.error('[Middleware DEBUG] Auth/CSP error:', err);
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'session_expired');
      const redirect = NextResponse.redirect(url);
      redirect.cookies.delete('access_token');
      redirect.cookies.delete('refresh_token');
      redirect.cookies.delete('csrf_token');
      return redirect;
    }
  }

  console.log('[Middleware DEBUG] Complete - returning response');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // catch-all except static
    '/dashboard/:path*',
    '/api/:path*',
  ],
};