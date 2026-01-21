import { NextRequest, NextResponse } from 'next/server';
import { verifyCSRF } from '@/lib/auth';  // Optional CSRF
import { getRow, run } from '@/lib/db';
import { StreamingTextResponse, OpenAIStream } from 'ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Optional CSRF check (keep if you want)
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  // NO requireAuth() — chat is open (dashboard page protects access)

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Extract latest user message
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

  // Metrics (optional — requires userId, skip or fetch from session if needed)
  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics ORDER BY date DESC LIMIT 1',  // No userId for now
    []
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

    const stream = OpenAIStream(grokResp);

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    console.error('[Grok Error]', e);
    return NextResponse.json({ reply: 'Connection error — could not reach Grok' });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });