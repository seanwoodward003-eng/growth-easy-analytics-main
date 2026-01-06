// app/api/generate-winback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const metric = await getRow<{ churn_rate: number; at_risk: number; revenue: number }>(
    'SELECT churn_rate, at_risk, revenue FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const summary = metric
    ? `Churn: ${metric.churn_rate}%, At-risk customers: ${metric.at_risk}, Monthly revenue: £${metric.revenue || 0}`
    : 'General Shopify store';

  const prompt = `You are GrowthEasy AI, a world-class email copywriter.
Write a personalized win-back email for a Shopify store with these metrics: ${summary}.
Goal: Recover at-risk customers.
Include:
- Warm, friendly tone
- Acknowledge they haven't shopped in a while
- Offer 20% off with code COME BACK20
- Highlight popular products or "we miss you"
- Strong CTA
- Keep under 200 words

Make it fresh and different every time — vary wording, structure, and emotional hook.`;

  try {
    const resp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,  // Higher for creativity
        max_tokens: 400,
      }),
    });

    if (!resp.ok) throw new Error('Grok failed');
    const data = await resp.json();
    const template = data.choices[0].message.content.trim();

    return NextResponse.json({ template });
  } catch (e) {
    console.error('Win-back Grok error:', e);
    // Fallback only if Grok completely fails
    return NextResponse.json({
      template: `Subject: We Miss You! Here's 20% Off ❤️

Hi [Name],

It's been a while since we saw you in the store — we hope everything's good on your end!

We wanted to say thank you for being part of our community and offer you a special welcome back: 20% off your next order with code COMEBACK20.

Valid for the next 7 days — no minimum spend.

Come back and treat yourself,
The [Store Name] Team`
    });
  }
}