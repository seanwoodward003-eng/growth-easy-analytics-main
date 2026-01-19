import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { getRow, run } from '@/lib/db';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleSignup(json: any) {
  const email = (json.email || '').toLowerCase().trim();
  const consent = json.consent;
  const marketing_consent = json.marketing_consent; // New from form

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
    'INSERT INTO users (email, gdpr_consented, marketing_consented, trial_end, subscription_status, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [email, 1, marketing_consent ? 1 : 0, trialEnd.toISOString(), 'trial', verificationToken, tokenExpires.toISOString()]
  );

  const user = await getRow<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });

  // Send verification email
  try {
    await resend.emails.send({
      from: 'GrowthEasy AI <noreply@resend.dev>',

      to: email,
      subject: 'Verify your email – Start your 7-day free trial',
      html: `
        <html>
          <body style="font-family: system-ui, sans-serif; background: #0a0f2c; color: #e0f8ff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0f2c; border-radius: 16px; border: 2px solid #00ffff; box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);">
              <h1 style="text-align: center; color: #00ffff; font-size: 36px; text-shadow: 0 0 15px #00ffff; margin-bottom: 30px;">
                GROWTHEASY AI
              </h1>
              <p style="font-size: 20px; line-height: 1.6; text-align: center;">
                You're one click away from your <strong>7-day free trial</strong> of real-time growth intelligence.
              </p>
              <div style="text-align: center; margin: 50px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}"
                   style="display: inline-block; background: #00ffff; color: #000; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #00ffff;">
                  Activate Trial & Sign In
                </a>
              </div>
              <p style="font-size: 16px; color: #a0d8ef; text-align: center;">
                This link expires in <strong>24 hours</strong>.<br>
                After activation, you'll get full access to the AI Growth Coach powered by Grok.
              </p>
              <hr style="border-color: #00ffff40; margin: 50px 0;">
              <p style="text-align: center; color: #66cccc; font-size: 14px;">
                — The GrowthEasy AI Team<br>
                Making growth easy, one insight at a time.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  // RESPONSE — no cookies, no instant access
  const response = NextResponse.json({
    success: true,
    message: 'Verification email sent! Check your inbox to activate your 7-day free trial.',
  });

  return response;
}

export async function POST(request: NextRequest) {
  return handleSignup(await request.json());
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}