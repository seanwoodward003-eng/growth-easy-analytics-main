import { NextRequest, NextResponse } from 'next/server';
import { verifyCSRF } from '@/lib/auth';  // Optional CSRF
import { getRow, run } from '@/lib/db';
import { StreamingTextResponse, OpenAIStream } from 'ai';
import { fetchGA4Data } from '@/lib/integrations/ga4';
import { fetchHubSpotData } from '@/lib/integrations/hubspot';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Optional CSRF check
  if (!verifyCSRF(request)) {
    return NextResponse.json({ error: 'CSRF failed' }, { status: 403 });
  }

  // Get user ID from session (adjust if your auth uses different method)
  const authHeader = request.headers.get('authorization') || request.cookies.get('access_token')?.value;
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Replace this with your real auth/session logic to get userId
  // Example: const userId = await getUserIdFromToken(authHeader);
  const userId = 1; // ← REPLACE WITH REAL USER ID FROM SESSION/AUTH

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  // ────────────────────────────────────────────────────────────────
  // FETCH USER METRICS (Shopify + GA4 + HubSpot)
  // ────────────────────────────────────────────────────────────────
  let metricsSummary = 'No data available yet. Ask the user to connect their accounts.';

  try {
    // Shopify metrics (from your DB)
    const shopifyRow = await getRow(
      `SELECT revenue_total, churn_rate, repeat_rate, ltv, aov, at_risk 
       FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1`,
      [userId]
    );

    // GA4
    const ga4Data = await fetchGA4Data(userId);

    // HubSpot
    const hubspotData = await fetchHubSpotData(userId);

    // Build summary string (only include what's available)
    let summaryParts = [];

    if (shopifyRow) {
      summaryParts.push(
        `Revenue: £${shopifyRow.revenue_total?.toLocaleString() || '0'}`,
        `Churn rate: ${shopifyRow.churn_rate || 0}%`,
        `Repeat rate: ${shopifyRow.repeat_rate?.toFixed(1) || '0'}%`,
        `AOV: £${shopifyRow.aov?.toFixed(2) || '0.00'}`,
        `LTV: £${shopifyRow.ltv?.toFixed(0) || '0'}`,
        `At-risk customers: ${shopifyRow.at_risk || 0}`
      );
    }

    if (ga4Data) {
      summaryParts.push(
        `Sessions (GA4): ${ga4Data.sessions || 0}`,
        `Bounce rate (GA4): ${ga4Data.bounceRate?.toFixed(1) || '0'}%`,
        `Top channel (GA4): ${ga4Data.topChannels?.[0]?.sourceMedium || 'Unknown'}`,
        `Estimated CAC (GA4): £${ga4Data.estimatedCac?.toFixed(2) || '0'}`
      );
    }

    if (hubspotData) {
      summaryParts.push(
        `Email open rate (HubSpot): ${hubspotData.openRate?.toFixed(1) || 'N/A'}%`,
        `Email click rate (HubSpot): ${hubspotData.clickRate?.toFixed(1) || 'N/A'}%`,
        `At-risk contacts (HubSpot): ${hubspotData.atRiskContacts || 0}`
      );
    }

    if (summaryParts.length > 0) {
      metricsSummary = summaryParts.join(' • ');
    }
  } catch (err) {
    console.error('[Chat Metrics Error]', err);
    metricsSummary = 'Error loading metrics — using general knowledge.';
  }

  // System prompt with metrics injected
  const systemPrompt = `You are GrowthEasy AI, a sharp growth coach for Shopify stores.
You have full access to the user's real-time store metrics below.

Current metrics: ${metricsSummary}

Use these numbers in your answers. Be specific, actionable, and direct. Reference actual figures when relevant (e.g. "Your churn is 8% with 45 at-risk customers — focus on win-back emails").
If no data, say "Connect your accounts to unlock personalized insights."

Respond concisely in under 150 words.`;

  // Full messages with system prompt first
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...body.messages,
  ];

  try {
    const grokResp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    });

    if (!grokResp.ok) {
      const errorText = await grokResp.text();
      return NextResponse.json({ reply: `Grok error ${grokResp.status}: ${errorText}` });
    }

    const stream = OpenAIStream(grokResp);

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    console.error('[Grok Error]', e);
    return NextResponse.json({ reply: 'Connection error — could not reach Grok' });
  }
}

export const OPTIONS = () => new Response(null, { status: 200 });