import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyCSRF } from '@/lib/auth';
import { getRow, run } from '@/lib/db';
import { StreamingTextResponse, AIStream } from 'ai';  // ← Correct imports for v3

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

  // Rate limit
  const recentChats = await getRow<{ count: number }>(
    `SELECT COUNT(*) as count FROM rate_limits WHERE user_id = ? AND endpoint = 'chat' AND timestamp > datetime('now', '-1 minute')`,
    [userId]
  );

  const recentCount = recentChats?.count ?? 0;
  if (recentCount >= 8) {
    return NextResponse.json({ error: 'Rate limit exceeded — maximum 8 messages per minute' }, { status: 429 });
  }

  await run('INSERT INTO rate_limits (user_id, endpoint) VALUES (?, "chat")', [userId]);

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Extract user message
  let userMessage = '';
  if (Array.isArray(body.messages)) {
    const latest = [...body.messages].reverse().find(m => m.role === 'user' && typeof m.content === 'string');
    userMessage = latest?.content?.trim() || '';
  }
  if (!userMessage && typeof body.message === 'string') {
    userMessage = body.message.trim();
  }

  if (!userMessage) {
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  // Metrics
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
    const grokResp = await fetch('https://api.x.ai/v1/chat/completions', {
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

    if (!grokResp.ok) {
      const errorText = await grokResp.text();
      return NextResponse.json({ reply: `Grok error ${grokResp.status}` });
    }

    // Transform OpenAI/Grok stream → Vercel AI format using AIStream
    const stream = AIStream(grokResp.body!, {
      onStart: async () => {},
      onToken: async (token: string) => {},
      onCompletion: async (completion: string) => {},
      // This maps Grok's delta.content → token
      transform(chunk: string) {
        try {
          const data = JSON.parse(chunk);
          return data.choices?.[0]?.delta?.content || '';
        } catch {
          return '';
        }
      },
    });

    // Return in format useChat expects
    return new StreamingTextResponse(stream);
  } catch (e: any) {
    console.error('[Grok Error]', e);
    return NextResponse.json({ reply: 'Connection error — could not reach Grok' });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });