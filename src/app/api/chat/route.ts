import { NextRequest, NextResponse } from 'next/server';
import { verifyCSRF } from '@/lib/auth';  // Optional CSRF
import { getRow } from '@/lib/db';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log('[DEBUG CHAT] POST request received to /api/chat');

  if (!verifyCSRF(request)) {
    console.log('[DEBUG CHAT] CSRF check failed');
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
    console.log('[DEBUG CHAT] Request body parsed successfully', body);
  } catch (e) {
    console.error('[DEBUG CHAT] Failed to parse JSON body', e);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let userMessage = '';
  if (Array.isArray(body.messages)) {
    const latest = [...body.messages].reverse().find(m => m.role === 'user' && typeof m.content === 'string');
    userMessage = latest?.content?.trim() || '';
  }
  if (!userMessage && typeof body.message === 'string') {
    userMessage = body.message.trim();
  }

  console.log('[DEBUG CHAT] Extracted user message:', userMessage || '(empty)');

  if (!userMessage) {
    console.log('[DEBUG CHAT] No valid user message');
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics ORDER BY date DESC LIMIT 1',
    []
  );

  const summary = metric
    ? `Revenue: £${metric.revenue || 0}, Churn: ${metric.churn_rate || 0}%, At-risk: ${metric.at_risk || 0}`
    : 'No data';

  console.log('[DEBUG CHAT] Metrics summary:', summary);

  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach. User metrics: ${summary}. 
Answer concisely in under 150 words. Be actionable, direct, helpful. Question: ${userMessage}`;

  console.log('[DEBUG CHAT] System prompt ready — calling Grok');

  try {
    const grokResp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',  // ← your original model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    });

    console.log('[DEBUG CHAT] Grok API response status:', grokResp.status);

    if (!grokResp.ok) {
      const errorText = await grokResp.text();
      console.error('[DEBUG CHAT] Grok API error:', errorText);
      return NextResponse.json({ reply: `Grok error ${grokResp.status}: ${errorText}` }, { status: grokResp.status });
    }

    console.log('[DEBUG CHAT] Grok stream starting — passthrough');

    return new Response(grokResp.body, {
      status: grokResp.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e: any) {
    console.error('[DEBUG CHAT] Full API error:', e.message, e.stack);
    return NextResponse.json({ reply: 'Connection error — could not reach Grok' }, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });