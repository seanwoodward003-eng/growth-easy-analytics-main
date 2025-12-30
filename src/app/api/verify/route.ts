// app/api/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE verification_token = ?', [token]);

  if (!user) {
    return NextResponse.redirect(new URL('/?error=invalid_or_expired_token', request.url));
  }

  await run('UPDATE users SET verification_token = NULL WHERE id = ?', [user.id]);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}