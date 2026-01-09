// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getRow } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY!;

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL!,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

// Public routes that do NOT require authentication (OAuth callbacks)
const PUBLIC_API_PATHS = [
  '/api/auth/shopify/callback',
  '/api/auth/ga4/callback',
  '/api/auth/hubspot/callback',
  // Add any future OAuth callbacks here
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for public OAuth callback routes (external redirects have no cookies)
  if (PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  let response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS for API routes
  if (pathname.startsWith('/api')) {
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

  // HTTPS redirect in production
  if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Protect dashboard routes + data APIs
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/metrics') ||
    pathname.startsWith('/api/refresh')
    // Add any other protected API paths here
  ) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    let payload: any;
    try {
      payload = jwt.verify(accessToken, JWT_SECRET);
    } catch (err) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'session_expired');

      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.cookies.delete('access_token');
      redirectResponse.cookies.delete('refresh_token');
      redirectResponse.cookies.delete('csrf_token');
      return redirectResponse;
    }

    const userId = payload.sub;

    try {
      const user = await getRow<{
        trial_end: string | null;
        subscription_status: string;
      }>(
        'SELECT trial_end, subscription_status FROM users WHERE id = ?',
        [userId]
      );

      if (!user) throw new Error('User not found');

      const now = new Date();
      const trialEnd = user.trial_end ? new Date(user.trial_end) : null;

      if (
        user.subscription_status === 'trial' &&
        trialEnd &&
        now > trialEnd
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'trial_expired');
        return NextResponse.redirect(url);
      }

      response.headers.set('x-user-id', userId.toString());
    } catch (dbError) {
      console.error('Middleware trial check error:', dbError);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};