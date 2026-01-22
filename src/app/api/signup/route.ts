import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleSignup(json: any) {
  console.log('[SIGNUP] Request received. Body:', json);

  const email = (json.email || '').toLowerCase().trim();
  const consent = json.consent;
  const marketing_consent = json.marketing_consent;

  console.log('[SIGNUP] Parsed fields:', { email, consent, marketing_consent });

  if (!email || !/@.+\..+/.test(email) || !consent) {
    console.log('[SIGNUP] Validation failed');
    return NextResponse.json({ error: 'Valid email and consent required' }, { status: 400 });
  }

  // Check main users
  const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    console.log('[SIGNUP] Already verified in users:', email);
    return NextResponse.json({ error: 'Email already registered. Please log in.' }, { status: 400 });
  }

  // Check pending
  const pending = await getRow('SELECT id FROM pending_users WHERE email = ?', [email]);
  if (pending) {
    console.log('[SIGNUP] Already pending:', email);
    return NextResponse.json({ error: 'Verification email already sent. Check your inbox.' }, { status: 400 });
  }

  const verificationToken = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  console.log('[SIGNUP] Inserting into pending_users:', email);

  try {
    await run(
      'INSERT INTO pending_users (email, gdpr_consented, marketing_consented, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?)',
      [email, consent ? 1 : 0, marketing_consent ? 1 : 0, verificationToken, tokenExpires.toISOString()]
    );
  } catch (dbError) {
    console.error('[SIGNUP] DB insert failed:', dbError);
    return NextResponse.json({ error: 'Database error - try again' }, { status: 500 });
  }

  try {
    console.log('[SIGNUP] Sending verification to:', email);
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
                You're one click away from your <strong>7-day free trial</strong>.
              </p>
              <div style="text-align: center; margin: 50px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}"
                   style="display: inline-block; background: #00ffff; color: #000; font-weight: bold; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-size: 24px; box-shadow: 0 0 30px #00ffff;">
                  Activate Trial & Sign In
                </a>
              </div>
              <p style="font-size: 16px; color: #a0d8ef; text-align: center;">
                This link expires in <strong>24 hours</strong>.
              </p>
              <hr style="border-color: #00ffff40; margin: 50px 0;">
              <p style="text-align: center; color: #66cccc; font-size: 14px;">
                — The GrowthEasy AI Team
              </p>
            </div>
          </body>
        </html>
      `,
    });
    console.log('[SIGNUP] Email queued successfully');
  } catch (emailError) {
    console.error('[SIGNUP] Email send failed:', emailError);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Verification email sent! Check your inbox to activate your account.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return handleSignup(body);
  } catch (err) {
    console.error('[SIGNUP] POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}