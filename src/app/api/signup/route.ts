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

  // Prevent duplicate emails
  const existing = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered. Please log in.' }, { status: 400 });
  }

  // 7-day free trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  // 24-hour verification token
  const verificationToken = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  await run(
    'INSERT INTO users (email, gdpr_consented, trial_end, subscription_status, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?)',
    [email, 1, trialEnd.toISOString(), 'trial', verificationToken, tokenExpires.toISOString()]
  );

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });

  // Send verification email
  try {
    await resend.emails.send({
      from: 'GrowthEasy AI <verify@growtheasy.ai>',
      to: email,
      subject: 'Verify your email – Start your 7-day free trial',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #0a0f2c; color: #e0f8ff; border-radius: 16px; border: 2px solid #00ffff;">
          <h1 style="text-align: center; color: #00ffff; text-shadow: 0 0 10px #00ffff;">Welcome to GrowthEasy AI</h1>
          <p style="font-size: 18px; line-height: 1.6;">
            You're one click away from unlocking your <strong>7-day free trial</strong> of real-time growth intelligence powered by Grok.
          </p>
          <p style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/verify?token=${verificationToken}"
               style="display: inline-block; background: #00ffff; color: #000; font-weight: bold; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 20px; box-shadow: 0 0 20px #00ffff;">
              Verify Email & Activate Trial
            </a>
          </p>
          <p style="font-size: 16px; color: #a0d8ef;">
            This link expires in <strong>24 hours</strong>.<br>
            After verification, you'll get full access to the AI Growth Coach that reads your real store data and gives actionable insights.
          </p>
          <hr style="border-color: #00ffff40; margin: 40px 0;">
          <p style="text-align: center; color: #66cccc; font-size: 14px;">
            — The GrowthEasy AI Team<br>
            Making growth easy, one insight at a time.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    // Don't fail signup if email fails — user can still get in via resend if needed
  }

  const { access, refresh } = generateTokens(user.id, email);
  const csrf = randomBytes(32).toString('hex');

  const response = NextResponse.json({
    success: true,
    message: 'Check your email! Verify to activate your 7-day free trial.',
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