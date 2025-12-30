// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { getRow, run } from '@/lib/db';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleSignup(json: any) {
  const email = (json.email || '').toLowerCase().trim();
  const consent = json.consent;

  if (!email || !/@.+\..+/.test(email) || !consent) {
    return NextResponse.json({ error: 'Valid email and consent required' }, { status: 400 });
  }

  const existing = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered. Please log in.' }, { status: 400 });
  }

  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const verificationToken = randomBytes(32).toString('hex');

  await run(
    'INSERT INTO users (email, gdpr_consented, trial_end, subscription_status, verification_token) VALUES (?, ?, ?, ?, ?)',
    [email, 1, trialEnd, 'trial', verificationToken]
  );

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return NextResponse.json({ error: 'Failed' }, { status: 500 });

  // Send verification email
  await resend.emails.send({
    from: 'verify@growtheasy.ai',
    to: email,
    subject: 'Verify your GrowthEasy AI account',
    html: `
      <h2>Welcome to GrowthEasy AI!</h2>
      <p>Click the link below to verify your email and activate your 7-day free trial:</p>
      <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/verify?token=${verificationToken}">
        <button style="background:#00ffff;color:black;padding:12px 24px;border:none;border-radius:8px;font-weight:bold;">
          Verify Email & Start Trial
        </button>
      </a>
      <p>This link expires in 24 hours.</p>
      <p>— The GrowthEasy AI Team</p>
    `,
  });

  const { access, refresh } = generateTokens(user.id, email);
  const csrf = randomBytes(32).toString('hex');

  const response = NextResponse.json({
    success: true,
    message: 'Check your email to verify and activate your trial!',
  });

  await setAuthCookies(access, refresh, csrf);
  return response;
}

export async function POST(request: NextRequest) {
  return handleSignup(await request.json());
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}