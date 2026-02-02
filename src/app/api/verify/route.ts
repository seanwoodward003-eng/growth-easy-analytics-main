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

  const pendingUser = await getRow<{ 
    id: number; 
    email: string; 
    gdpr_consented: number;
    marketing_consented: number;
    verification_token_expires: string | null;
  }>(
    'SELECT id, email, gdpr_consented, marketing_consented, verification_token_expires FROM pending_users WHERE verification_token = ?',
    [token]
  );

  if (!pendingUser) {
    console.log('Verify: Invalid token - no pending user found');
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  if (pendingUser.verification_token_expires && new Date(pendingUser.verification_token_expires) < new Date()) {
    console.log('Verify: Token expired for pending user:', pendingUser.id);
    await run('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);
    return NextResponse.redirect(new URL('/?error=token_expired', request.url));
  }

  // Move to main users table
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  console.log('Verify: Moving pending user to main users table:', pendingUser.email);

  await run(
    'INSERT INTO users (email, gdpr_consented, marketing_consented, trial_end, subscription_status, verified) VALUES (?, ?, ?, ?, ?, ?)',
    [pendingUser.email, pendingUser.gdpr_consented, pendingUser.marketing_consented, trialEnd.toISOString(), 'trial', 1]
  );

  const newUser = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [pendingUser.email]);

  if (!newUser) {
    console.error('Verify: Failed to create main user after move');
    return NextResponse.redirect(new URL('/?error=activation_failed', request.url));
  }

  // Clean up pending
  await run('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);

  console.log('Verify: Token valid - logging in user:', newUser.id, pendingUser.email);

  // ── ADD AWAIT HERE ──
  const { access, refresh } = await generateTokens(newUser.id, pendingUser.email);

  const csrf = crypto.randomBytes(32).toString('hex');

  const response = NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  await setAuthCookies(access, refresh, csrf);

  console.log('Verify: Success - cookies set, redirecting to dashboard');

  return response;
}