// src/app/api/chat/route.ts

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

interface User {
  id: number;
  email: string;
}

function getUserFromCookie(req: NextRequest): User | null {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}

async function fetchUserMetrics(userId: number) {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '') || 'https://your-backend.onrender.com';

  const response = await fetch(`${backendUrl}/api/metrics`, {
    credentials: 'include',
    headers: {
      Cookie: cookies()
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join('; '),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend metrics error: ${response.status}`);
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  const user = getUserFromCookie(req);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await req.json();

  let metrics: any;
  try {
    metrics = await fetchUserMetrics(user.id);
  } catch (err) {
    console.error('Failed to fetch metrics:', err);
    metrics = {
      revenue: { total: 0, trend: '0%' },
      churn: { rate: 0, at_risk: 0 },
      performance: { ltv: 0, cac: 0, ratio: '0' },
      acquisition: { top_channel: 'None', acquisition_cost: 0 },
      retention: { rate: 0 },
      ai_insight: 'No data connected yet',
    };
  }

  const metricsSummary = `
Revenue: £${metrics.revenue?.total || 0} (${metrics.revenue?.trend || '0%'})
Churn Rate: ${metrics.churn?.rate || 0}%
At-Risk Customers: ${metrics.churn?.at_risk || 0}
LTV: £${metrics.performance?.ltv || 0}
CAC: £${metrics.performance?.cac || 0}
LTV/CAC Ratio: ${metrics.performance?.ratio || '0'}
Top Acquisition Channel: ${metrics.acquisition?.top_channel || 'Unknown'}
Acquisition Cost: £${metrics.acquisition?.acquisition_cost || 0}
Retention Rate: ${metrics.retention?.rate || 0}%
  `.trim();

  const systemPrompt = `You are AI Insights — a world-class SaaS growth analyst powered by Grok.

Your role: Deliver sharp, profitable, data-backed insights using the user's real business metrics.

Current real-time metrics:
${metricsSummary}

Guidelines:
- Always reference specific numbers from the metrics above.
- Be direct, confident, and actionable.
- Suggest concrete next steps and experiments.
- Focus on profit levers: reduce churn, lower CAC, increase LTV, optimize channels.
- Use markdown: **bold**, lists, > quotes, code blocks when helpful.
- Keep responses under 350 words.
- If integrations are missing, politely encourage connecting them.
- Light humor is welcome if it fits naturally.`;

  const enhancedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4', // Best reasoning; use 'grok-3' for faster/cheaper
      messages: enhancedMessages,
      temperature: 0.75,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!grokResponse.ok) {
    const error = await grokResponse.text();
    console.error('Grok API error:', error);
    return new Response('AI service unavailable. Try again soon.', { status: 503 });
  }

  return new Response(grokResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';