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

  // Security headers (keep these)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // TEMPORARILY DISABLE CSP FOR TESTING
  // response.headers.set('Content-Security-Policy', '...');   ← COMMENTED OUT / REMOVED

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

  // Dashboard protection
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
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
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      response.headers.set('x-user-id', userId.toString());
      response.headers.set('x-subscription-status', user.subscription_status);
      response.headers.set('x-trial-end', user.trial_end || '');
    } catch (err) {
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