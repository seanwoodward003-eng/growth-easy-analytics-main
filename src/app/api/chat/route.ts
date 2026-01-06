import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyCSRF } from '@/lib/auth';
import { getRow, run } from '@/lib/db';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  const auth = await requireAuth();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  // RATE LIMIT: 8 messages per minute per user
  const recentChats = await getRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM rate_limits 
     WHERE user_id = ? AND endpoint = 'chat' 
     AND timestamp > datetime('now', '-1 minute')`,
    [userId]
  );

  const recentCount = recentChats?.count ?? 0;

  if (recentCount >= 8) {
    return NextResponse.json(
      { error: 'Rate limit exceeded — maximum 8 messages per minute' },
      { status: 429 }
    );
  }

  await run(
    'INSERT INTO rate_limits (user_id, endpoint) VALUES (?, "chat")',
    [userId]
  );

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Extract the latest user message from Vercel AI SDK / useChat format
  let userMessage = '';
  if (Array.isArray(body.messages)) {
    const latestUserMsg = [...body.messages]
      .reverse()
      .find(m => m.role === 'user' && typeof m.content === 'string');
    userMessage = latestUserMsg?.content?.trim() || '';
  }

  // Fallback for simple { message: "..." } format (in case you ever change frontend)
  if (!userMessage && typeof body.message === 'string') {
    userMessage = body.message.trim();
  }

  if (!userMessage) {
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  // Fetch latest metrics for the user
  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const summary = metric
    ? `Revenue: £${metric.revenue || 0}, Churn: ${metric.churn_rate || 0}%, At-risk: ${metric.at_risk || 0}`
    : 'No data';

  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach. User metrics: ${summary}. 
Answer the question concisely in under 150 words. Be actionable, direct, and helpful. Question: ${userMessage}`;

  try {
    console.log('[Grok Request] User:', userId, '| Message:', userMessage);

    const resp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[Grok API Error] Status:', resp.status, '| Body:', errorText);
      return NextResponse.json({ reply: `Grok error ${resp.status}: ${errorText.substring(0, 300)}` });
    }

    return new Response(resp.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    console.error('[Grok Fetch Error]', e.message || e);
    return NextResponse.json({ reply: `Connection error: ${e.message || 'Could not reach Grok'}` });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });