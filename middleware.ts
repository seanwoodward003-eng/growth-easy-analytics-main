import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_FRONTEND_URL!,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  let response = NextResponse.next();

  // ────────────────────────────────────────────────
  // Security headers (kept — recommended even for public apps)
  // ────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CSP — kept your existing policy (single line to prevent parsing issues)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com https://js.hs-scripts.com https://*.hubspot.com https://js.hs-banner.com https://js.hsadspixel.net https://api.x.ai https://grok.x.ai; connect-src 'self' https://api.stripe.com https://*.stripe.com https://checkout.stripe.com https://api.shopify.com https://*.shopify.com https://www.google-analytics.com https://*.google-analytics.com https://api.hubapi.com https://*.hubspot.com https://api.x.ai https://grok.x.ai; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.shopify.com https://forms.hsforms.com https://*.hubspot.com; img-src 'self' data: https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com https://cdn.shopify.com https://*.hubspot.com https://*.hsadspixel.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
  );

  // ────────────────────────────────────────────────
  // CORS handling for API routes (kept — useful if frontend calls backend)
  // ────────────────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin!);
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // ────────────────────────────────────────────────
  // Force HTTPS in production (kept — good security practice)
  // ────────────────────────────────────────────────
  if (
    request.headers.get('x-forwarded-proto') === 'http' &&
    process.env.NODE_ENV === 'production'
  ) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // ────────────────────────────────────────────────
  // IMPORTANT: No authentication / login check anymore
  // Dashboard and all other pages are fully public
  // ────────────────────────────────────────────────

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api (already handled above)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Still apply to dashboard paths (but without blocking)
    '/dashboard/:path*',
  ],
};