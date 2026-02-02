// app/api/chat/route.ts
import { xai } from '@ai-sdk/xai';
import { streamText, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';

// Allow longer execution time for complex responses / reasoning
export const maxDuration = 90;

// Optional: Use Node.js runtime if you experience edge runtime streaming issues
// export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body (useChat sends { messages: [...] })
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert UI messages → ModelMessages (required in AI SDK v6)
    const modelMessages = await convertToModelMessages(messages);

    // Define system prompt for growth coach behavior
    const systemPrompt = `
You are Grok, an expert AI growth coach built by xAI.
You specialize in helping startups, SaaS companies, founders, and product teams with:

- Growth strategies (product-led, marketing, viral loops)
- Reducing churn and increasing retention
- Revenue optimization (pricing, LTV, expansion revenue)
- User acquisition channels and cost-efficient scaling
- SaaS metrics (MRR, ARR, NRR, CAC, LTV:CAC, churn rate, etc.)
- Product-market fit and positioning
- Fundraising, go-to-market, and scaling advice

Be direct, data-driven, practical, and concise.
Use markdown formatting (tables, bullet points, bold, code blocks) when helpful.
Give actionable advice with clear next steps.
Be honest — call out bad assumptions or risky ideas.
Occasionally add humor or wit when it fits naturally.
Never give generic answers — tailor insights to the user's specific context when provided.
    `.trim();

    // Stream text from Grok using the fast-reasoning variant
    const result = await streamText({
      model: xai('grok-4-fast-reasoning'),

      messages: [
        { role: 'system', content: systemPrompt },
        ...modelMessages,
      ],

      // Optional tuning
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    // Return in format that useChat expects (v6 rename)
    return result.toTextStreamResponse({
      headers: {
        'x-vercel-ai-ui-message-stream': 'v1', // still useful as safety net
      },
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to get response from Grok',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}