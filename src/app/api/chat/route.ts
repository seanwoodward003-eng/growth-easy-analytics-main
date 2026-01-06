import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyCSRF } from '@/lib/auth';
import { getRow, run } from '@/lib/db';

export const maxDuration = 60;  // ← Kept from your original

export async function POST(request: NextRequest) {
  console.log('[DEBUG] POST /api/chat request received');

  if (!verifyCSRF(request)) {
    console.log('[DEBUG] CSRF verification FAILED');
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }
  console.log('[DEBUG] CSRF passed');

  const auth = await requireAuth();
  console.log('[DEBUG] Auth result:', JSON.stringify(auth));
  if ('error' in auth) {
    console.log('[DEBUG] Auth failed:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;
  console.log('[DEBUG] Authenticated user ID:', userId);

  // Rate limit check
  const recentChats = await getRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM rate_limits 
     WHERE user_id = ? AND endpoint = 'chat' 
     AND timestamp > datetime('now', '-1 minute')`,
    [userId]
  );
  console.log('[DEBUG] Recent chat count in last minute:', recentChats?.count ?? 'null');

  if (recentChats?.count >= 8) {
    console.log('[DEBUG] Rate limit EXCEEDED');
    return NextResponse.json(
      { error: 'Rate limit exceeded — maximum 8 messages per minute' },
      { status: 429 }
    );
  }

  await run(
    'INSERT INTO rate_limits (user_id, endpoint) VALUES (?, "chat")',
    [userId]
  );
  console.log('[DEBUG] Rate limit row inserted');

  let body;
  try {
    body = await request.json();
    console.log('[DEBUG] Raw request body:', JSON.stringify(body));
  } catch (e: any) {
    console.log('[DEBUG] Failed to parse JSON body:', e.message);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message } = body;
  console.log('[DEBUG] Extracted message:', JSON.stringify(message));

  if (!message?.trim()) {
    console.log('[DEBUG] Message is empty/missing → sending fallback');
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  console.log('[DEBUG] Message valid → continuing to Grok');

  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );
  console.log('[DEBUG] Metrics row:', JSON.stringify(metric));

  const summary = metric
    ? `Revenue: £${metric.revenue || 0}, Churn: ${metric.churn_rate || 0}%, At-risk: ${metric.at_risk || 0}`
    : 'No data';

  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach. User metrics: ${summary}. 
  Answer the question concisely in under 150 words. Be actionable, direct, and helpful. Question: ${message}`;

  try {
    console.log('[Grok Request] User:', userId, '| Message:', message);
    console.log('[DEBUG] About to call xAI API...');

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
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    });

    console.log('[DEBUG] xAI API response status:', resp.status);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[Grok API Error] Status:', resp.status, '| Body:', errorText.substring(0, 500));
      return NextResponse.json({ reply: `Grok error ${resp.status}: ${errorText.substring(0, 300)}` });
    }

    console.log('[DEBUG] Streaming response from Grok');
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

export const OPTIONS = () => new Response(null, { status: 200 });  // ← Kept from your original