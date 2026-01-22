import { NextRequest, NextResponse } from 'next/server';
import { getRow, run } from '@/lib/db';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleSignup(json: any) {
  console.log('[SIGNUP] Full request body received:', json);

  const email = (json.email || '').toLowerCase().trim();
  const consent = json.consent;
  const marketing_consent = json.marketing_consent;

  console.log('[SIGNUP] Parsed fields:', { email, consent, marketing_consent });

  if (!email || !/@.+\..+/.test(email) || !consent) {
    console.log('[SIGNUP] Validation failed - invalid input');
    return NextResponse.json({ error: 'Valid email and consent required' }, { status: 400 });
  }

  // Check for duplicate in main users table
  const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    console.log('[SIGNUP] Email already verified in users table:', email);
    return NextResponse.json({ error: 'Email already registered. Please log in.' }, { status: 400 });
  }

  // Check for pending verification
  const pendingUser = await getRow('SELECT id FROM pending_users WHERE email = ?', [email]);
  if (pendingUser) {
    console.log('[SIGNUP] Email already pending verification:', email);
    return NextResponse.json({ error: 'Verification email already sent. Check your inbox or request a new one.' }, { status: 400 });
  }

  console.log('[SIGNUP] No duplicate or pending - proceeding with account creation');

  // 7-day free trial calculation
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  console.log('[SIGNUP] Trial end date calculated:', trialEnd.toISOString());

  // Generate one-time verification token
  const verificationToken = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);
  console.log('[SIGNUP] Verification token generated. Expires at:', tokenExpires.toISOString());

  // Insert into pending_users table (unverified)
  try {
    console.log('[SIGNUP] Inserting pending user into DB...');
    await run(
      'INSERT INTO pending_users (email, gdpr_consented, marketing_consented, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?)',
      [email, consent ? 1 : 0, marketing_consent ? 1 : 0, verificationToken, tokenExpires.toISOString()]
    );
    console.log('[SIGNUP] Pending user successfully inserted');
  } catch (dbError) {
    console.error('[SIGNUP] DB insert failed:', dbError);
    return NextResponse.json({ error: 'Failed to create pending account - database error' }, { status: 500 });
  }

  // Fetch the pending user ID for logging
  const pendingRecord = await getRow<{ id: number }>('SELECT id FROM pending_users WHERE email = ?', [email]);
  if (!pendingRecord) {
    console.error('[SIGNUP] Pending user not found after insert');
    return NextResponse.json({ error: 'Failed to create pending account' }, { status: 500 });
  }
  console.log('[SIGNUP] Pending user ID:', pendingRecord.id);

  // Send verification email
  try {
    console.log('[SIGNUP] Attempting to send verification email to:', email);
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
    console.log('[SIGNUP] Verification email successfully queued/sent to:', email);
  } catch (emailError) {
    console.error('[SIGNUP] Failed to queue/send verification email:', emailError);
    return NextResponse.json({ error: 'Failed to send verification email - please try again' }, { status: 500 });
  }

  console.log('[SIGNUP] Success - verification email queued');

  return NextResponse.json({
    success: true,
    message: 'Verification email sent! Check your inbox to activate your 7-day free trial.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[SIGNUP POST] Raw body parsed successfully');
    return handleSignup(body);
  } catch (parseError) {
    console.error('[SIGNUP POST] Failed to parse request body:', parseError);
    return NextResponse.json({ error: 'Invalid request body - please check your input' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}