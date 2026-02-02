import { NextRequest, NextResponse } from 'next/server';
import { verifyCSRF } from '@/lib/auth';
import { getRow } from '@/lib/db';
import { streamText } from '@ai-sdk/xai';  // ← Use xAI provider

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
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

  if (!userMessage) {
    return NextResponse.json({ reply: 'Ask me about churn, revenue, or growth.' });
  }

  // Optional metrics (no userId for now)
  const metric = await getRow<{ revenue: number; churn_rate: number; at_risk: number }>(
    'SELECT revenue, churn_rate, at_risk FROM metrics ORDER BY date DESC LIMIT 1',
    []
  );

  const summary = metric
    ? `Revenue: £${metric.revenue || 0}, Churn: ${metric.churn_rate || 0}%, At-risk: ${metric.at_risk || 0}`
    : 'No data';

  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach. User metrics: ${summary}. 
Answer concisely in under 150 words. Be actionable, direct, helpful. Question: ${userMessage}`;

  try {
    const result = await streamText({
      model: 'grok-beta',  // works with xAI provider
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    // New streaming response format for AI SDK v5+
    return result.toDataStreamResponse({
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e: any) {
    console.error('[Chat API Error]', e);
    return NextResponse.json({ reply: 'Connection error — could not reach Grok' }, { status: 500 });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });