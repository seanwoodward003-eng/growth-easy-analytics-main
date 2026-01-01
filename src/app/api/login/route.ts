// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { getRow } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  const json = await request.json();
  const email = (json.email || '').toLowerCase().trim();

  if (!email || !/@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Find existing user
  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) {
    return NextResponse.json({ error: 'No account found with this email. Please sign up.' }, { status: 404 });
  }

  // Generate fresh tokens
  const { access, refresh } = generateTokens(user.id, email);
  const csrf = randomBytes(32).toString('hex');

  const response = NextResponse.json({
    success: true,
    redirect: '/dashboard',
  });

  await setAuthCookies(access, refresh, csrf);
  return response;
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}