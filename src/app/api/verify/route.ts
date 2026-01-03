import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=no_token', request.url));
  }

  // Fetch user with token and expiry
  const user = await getRow<{ 
    id: number; 
    email: string; 
    verification_token_expires: string;
  }>(
    'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
    [token]
  );

  if (!user) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  // Check if token is expired
  const tokenExpires = new Date(user.verification_token_expires);
  if (tokenExpires < new Date()) {
    // Optional: clear expired token
    await run('UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
    return NextResponse.redirect(new URL('/?error=token_expired', request.url));
  }

  // Token valid — verify user and clear token data
  await run(
    'UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
    [user.id]
  );

  // Auto-login the user
  const { access, refresh } = generateTokens(user.id, user.email);
  const csrf = randomBytes(32).toString('hex');

  const response = NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  await setAuthCookies(response, access, refresh, csrf);  // Make sure setAuthCookies accepts response

  return response;
}