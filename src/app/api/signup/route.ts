// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { getRow, run } from '@/lib/db';
import { randomBytes } from 'crypto';

async function handleSignup(json: any) {
  const email = (json.email || '').toLowerCase().trim();
  const consent = json.consent;

  if (!email || !/@.+\..+/.test(email) || !consent) {
    return NextResponse.json({ error: 'Valid email and consent required' }, { status: 400 });
  }

  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const existing = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (!existing) {
    await run(
      'INSERT INTO users (email, gdpr_consented, trial_end, subscription_status) VALUES (?, ?, ?, ?)',
      [email, 1, trialEnd, 'trial']
    );
  }

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return NextResponse.json({ error: 'Failed' }, { status: 500 });

  const { access, refresh } = generateTokens(user.id, email);
  const csrf = randomBytes(32).toString('hex');

  const response = NextResponse.json({
    success: true,
    redirect: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
  });

  setAuthCookies(access, refresh, csrf);
  return response;
}

export async function POST(request: NextRequest) {
  return handleSignup(await request.json());
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}