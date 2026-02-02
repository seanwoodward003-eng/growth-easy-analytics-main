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

  // Protect dashboard routes – only login check
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('access_token')?.value;

    console.log('[MIDDLEWARE] Dashboard request – access_token present?', !!accessToken, 'length:', accessToken?.length || 0);

    if (!accessToken) {
      console.log('[MIDDLEWARE] No access_token — redirecting with login_required');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET_KEY);

      const userIdStr = payload.sub;
      if (typeof userIdStr !== 'string') throw new Error('Invalid sub claim');

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      console.log('[MIDDLEWARE] Token verified, user ID:', userId);

      const user = await getRow<{
        trial_end: string | null;
        subscription_status: string;
      }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        console.log('[MIDDLEWARE] User not found in DB');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');
    } catch (err) {
      console.log('[MIDDLEWARE] Token verification failed:', (err as Error).message);
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

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};