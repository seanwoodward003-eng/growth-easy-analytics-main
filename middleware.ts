import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Bypassed for testing');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};