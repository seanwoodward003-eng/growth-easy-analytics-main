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
  console.log('[MW] INVOKED - Full URL:', request.url);
  console.log('[MW] Path:', request.nextUrl.pathname);
  console.log('[MW] Query:', Object.fromEntries(request.nextUrl.searchParams));
  console.log('[MW] Embedded?', request.nextUrl.searchParams.has('embedded'));
  console.log('[MW] Shop:', request.nextUrl.searchParams.get('shop'));

  let response = NextResponse.next();

  // Global security (no X-Frame-Options!)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Skip HTTPS redirect in prod - Vercel handles it
  // Comment out or remove this block entirely for now
  // if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') { ... }

  // CORS for API (unchanged)
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

  // Embedded logic: Run if ?embedded=1 OR /dashboard OR root
  const isEmbedded = 
    request.nextUrl.searchParams.has('embedded') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '';

  if (isEmbedded) {
    console.log('[MW] Embedded-like request - processing');

    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      console.log('[MW] No token - redirect login');
      const url = request.nextUrl.clone();
      url.pathname = '/login'; // or '/' with error
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);
      const userId = parseInt(payload.sub as string, 10);

      const user = await getRow<{ trial_end: string | null; subscription_status: string }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      response.headers.set('x-user-id', userId.toString());
      // ... other headers

      // CSP - force it here
      console.log('[MW] Setting CSP');
      const shop = request.nextUrl.searchParams.get('shop');
      let frameAncestors = "frame-ancestors 'self' https://admin.shopify.com;";
      if (shop && shop.endsWith('.myshopify.com')) {
        frameAncestors += ` https://${shop};`;
        console.log('[MW] Added shop domain:', shop);
      } else {
        console.log('[MW] No shop - fallback only admin');
      }

      const csp = `${frameAncestors} ` +
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; " +
        "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
        "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; " +
        "child-src 'self' blob: https://js.stripe.com https://checkout.stripe.com; " +
        "img-src 'self' data: blob: https://*.stripe.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:;";

      console.log('[MW] CSP:', csp);
      response.headers.set('Content-Security-Policy', csp);

    } catch (err) {
      console.error('[MW] Error:', err);
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'session_expired');
      const res = NextResponse.redirect(url);
      res.cookies.delete('access_token');
      // ... delete others
      return res;
    }
  }

  console.log('[MW] Done');
  return response;
}

export const config = {
  matcher: [
    // Catch root + any path with embedded query
    {
      source: '/:path*',
      missing: [
        { type: 'regex', key: 'path', regex: '^/api|^/_next|^/static|^/favicon.ico' }
      ]
    },
    // Or more precise for root with embedded
    {
      source: '/',
      has: [{ type: 'query', key: 'embedded' }]
    },
    '/dashboard/:path*',
    '/api/:path*',
  ],
};