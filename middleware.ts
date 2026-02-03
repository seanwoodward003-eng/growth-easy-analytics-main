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
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  let response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CSP as SINGLE LINE to avoid middleware crash
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com https://js.hs-scripts.com https://*.hubspot.com https://js.hs-banner.com https://js.hsadspixel.net https://api.x.ai https://grok.x.ai; connect-src 'self' https://api.stripe.com https://*.stripe.com https://checkout.stripe.com https://api.shopify.com https://*.shopify.com https://www.google-analytics.com https://*.google-analytics.com https://api.hubapi.com https://*.hubspot.com https://api.x.ai https://grok.x.ai; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.shopify.com https://forms.hsforms.com https://*.hubspot.com; img-src 'self' data: https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com https://cdn.shopify.com https://*.hubspot.com https://*.hsadspixel.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:;");

  // CORS for API
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

  // HTTPS redirect
  if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // DASHBOARD IS NOW PUBLIC – NO LOGIN/SIGNUP REQUIRED
  // (entire dashboard protection block removed)

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};