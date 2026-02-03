import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Name and valid email required' }, { status: 400 });
    }

    // Send to your email
    const { data, error } = await resend.emails.send({
      from: 'Waiting List <onboarding@resend.dev>', // or your verified domain
      to: 'seanwoodward003@gmail.com',  // ← your email
      subject: 'New Waiting List Signup',
      html: `
        <h2>New Waiting List Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <br/>
        <p>Reply to this email to contact them directly.</p>
      `,
      reply_to: email, // so you can reply directly to the user
    });

    if (error) {
      console.error('[WAITLIST] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Thanks for joining the waiting list!' });
  } catch (err) {
    console.error('[WAITLIST] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}