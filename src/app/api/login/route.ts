import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('[LOGIN] Login request received');

  const json = await request.json();
  const email = (json.email || '').toLowerCase().trim();

  console.log('[LOGIN] Email:', email);

  if (!email || !/@.+\..+/.test(email)) {
    console.log('[LOGIN] Invalid email');
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) {
    console.log('[LOGIN] No user found for email:', email);
    return NextResponse.json({ error: 'No account found with this email. Please sign up.' }, { status: 404 });
  }

  console.log('[LOGIN] User found, ID:', user.id);

  const { access, refresh } = generateTokens(user.id, email);
  const csrf = crypto.getRandomValues(new Uint8Array(32)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

  console.log('[LOGIN] Tokens generated, access length:', access.length);

  const response = NextResponse.json({
    success: true,
    redirect: '/dashboard',
  });

  await setAuthCookies(access, refresh, csrf);
  console.log('[LOGIN] Cookies set, redirecting to dashboard');

  return response;
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}