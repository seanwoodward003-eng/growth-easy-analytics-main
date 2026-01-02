import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyCSRF } from '@/lib/auth';
import { getRow, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  // RATE LIMIT: 8 messages per minute per user
  const recentChats = await getRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM rate_limits 
     WHERE user_id = ? AND endpoint = 'chat' 
     AND timestamp > datetime('now', '-1 minute')`,
    [userId]
  );

  if (recentChats!.count >= 8) {
    return NextResponse.json(
      { error: 'Rate limit exceeded — maximum 8 messages per minute' },
      { status: 429 }
    );
  }

  // Log this chat request
  await run(
    'INSERT INTO rate_limits (user_id, endpoint) VALUES (?, "chat")',
    [userId]
  );

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const summary = metric
    ? `Revenue: £${metric.revenue || 0}, Churn: ${metric.churn_rate || 0}%, At-risk: ${metric.at_risk || 0}`
    : 'No data';

  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach. User metrics: ${summary}. 
  Answer the question concisely in under 150 words. Be actionable, direct, and helpful. Question: ${message}`;

  try {
    console.log('Sending request to Grok API for user:', userId); // Will show in Vercel logs

    const resp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',  // Current working model (Jan 2026)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Grok API failed:', resp.status, errorText); // This WILL show in logs
      throw new Error(`Grok API error ${resp.status}: ${errorText}`);
    }

    const data = await resp.json();
    const reply = data.choices[0]?.message?.content?.trim() || 'No reply generated.';

    console.log('Grok success – reply sent'); // Confirmation in logs
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('Grok error:', e.message || e); // Exact error in Vercel logs
    return NextResponse.json({ reply: 'Try reducing churn with targeted emails.' });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });