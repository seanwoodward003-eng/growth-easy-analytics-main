import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    console.log('Verify: No token provided');
    return NextResponse.redirect(new URL('/?error=no_token', request.url));
  }

  console.log('Verify: Attempting with token:', token);

  const user = await getRow<{ 
    id: number; 
    email: string; 
    verification_token_expires: string | null;
  }>(
    'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
    [token]
  );

  if (!user) {
    console.log('Verify: Invalid token - no user found');
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  // Check expiry
  if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
    console.log('Verify: Token expired for user:', user.id);
    await run('UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
    return NextResponse.redirect(new URL('/?error=token_expired', request.url));
  }

  // Clear token (one-time use)
  await run(
    'UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
    [user.id]
  );

  console.log('Verify: Token valid - logging in user:', user.id, user.email);

  // Generate tokens and csrf
  const { access, refresh } = generateTokens(user.id, user.email);
  const csrf = crypto.randomBytes(32).toString('hex');

  // Set cookies and redirect
  const response = NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  await setAuthCookies(access, refresh, csrf);

  console.log('Verify: Success - cookies set, redirecting to dashboard');

  return response;
}