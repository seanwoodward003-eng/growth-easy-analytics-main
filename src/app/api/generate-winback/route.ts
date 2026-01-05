// app/api/generate-winback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const metrics = await getRow<{ churn_rate: number; at_risk: number }>(
    'SELECT churn_rate, at_risk FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const prompt = metrics
    ? `Write a personalized win-back email for Shopify customers. Churn rate: ${metrics.churn_rate}%. At-risk customers: ${metrics.at_risk}. Offer 20% off to return. Keep under 200 words. Friendly tone.`
    : 'Write a general win-back email for Shopify customers with 20% off offer. Friendly tone. Under 200 words.';

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
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!resp.ok) throw new Error('Grok failed');
    const data = await resp.json();
    const template = data.choices[0].message.content;

    return NextResponse.json({ template });
  } catch (e) {
    console.error('Grok email gen error:', e);
    return NextResponse.json({ template: 'Subject: We Miss You!\n\nHey [Name],\n\nWe noticed you haven\'t shopped in a while. Here\'s 20% off your next order: CODE20\n\nCome back soon!\n\nThe Team' });
  }
}