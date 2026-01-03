import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import crypto from 'crypto'; // ← Proper Node.js crypto import

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
  return NextResponse.redirect(new URL('/?error=no_token', request.url));
  }

  const user = await getRow<{ 
    id: number; 
    email: string; 
    verification_token_expires: string | null;
  }>(
    'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
    [token]
  );

  if (!user) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  // Check token expiry
  if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
    await run('UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
    return NextResponse.redirect(new URL('/?error=token_expired', request.url));
  }

  // Clear token
  await run(
    'UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
    [user.id]
  );

  // Generate tokens and csrf
  const { access, refresh } = generateTokens(user.id, user.email);
  const csrf = crypto.randomBytes(32).toString('hex');

  // Set cookies and redirect
  const response = NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  await setAuthCookies(access, refresh, csrf); // Your function uses the current response

  return response;
}