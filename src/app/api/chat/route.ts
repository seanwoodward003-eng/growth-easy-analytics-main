// src/app/api/chat/route.ts

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

interface User {
  id: number;
  email: string;
}

async function getUserFromCookie(req: NextRequest): Promise<User | null> {
  // Next.js 15: cookies() is now async!
  const cookieStore = await cookies();
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

  // Forward cookies properly
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  const response = await fetch(`${backendUrl}/api/metrics`, {
    credentials: 'include',
    headers: {
      Cookie: cookieHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Metrics fetch failed');
  return await response.json();
}

function createFallbackResponse(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: {"content": "${text.replace(/\n/g, '\\n')}"}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie(req);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { messages } = await req.json();

  // Teaser if no Grok key yet
  if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY.trim() === '') {
    return createFallbackResponse(
      "🔮 AI Insights is powering up!\\n\\nGrok integration launching very soon — you’ll get real-time, personalized growth advice based on your actual revenue, churn, CAC, LTV, and more.\\n\\nStay tuned… this is going to be game-changing. 🚀"
    );
  }

  let metrics: any;
  try {
    metrics = await fetchUserMetrics(user.id);
  } catch (err) {
    console.error('Metrics fetch failed:', err);
    metrics = {
      revenue: { total: 0, trend: '0%' },
      churn: { rate: 0, at_risk: 0 },
      performance: { ltv: 0, cac: 0, ratio: '0' },
      acquisition: { top_channel: 'None', acquisition_cost: 0 },
      retention: { rate: 0 },
    };
  }

  const metricsSummary = `
Revenue: £${metrics.revenue?.total || 0} (${metrics.revenue?.trend || '0%'})
Churn Rate: ${metrics.churn?.rate || 0}%
At-Risk: ${metrics.churn?.at_risk || 0}
LTV: £${metrics.performance?.ltv || 0}
CAC: £${metrics.performance?.cac || 0}
LTV/CAC: ${metrics.performance?.ratio || '0'}
Top Channel: ${metrics.acquisition?.top_channel || 'Unknown'}
Retention: ${metrics.retention?.rate || 0}%
  `.trim();

  const systemPrompt = `You are AI Insights — elite SaaS growth analyst powered by Grok.

Current metrics:
${metricsSummary}

Be direct, actionable, witty. Always reference real numbers. Suggest profit-maximizing moves. Use markdown. <350 words.`;

  const enhancedMessages = [{ role: 'system', content: systemPrompt }, ...messages];

  const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4',
      messages: enhancedMessages,
      temperature: 0.75,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!grokResponse.ok) {
    return createFallbackResponse("Grok is thinking deeply... 🧘 Try again soon!");
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