// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_FRONTEND_URL!,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');

  // HTTPS redirect (Vercel handles in prod)
  if (request.headers.get('x-forwarded-proto') === 'http' && process.env.NODE_ENV === 'production') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};