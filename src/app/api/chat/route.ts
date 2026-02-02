// app/api/chat/route.ts
import { xai } from '@ai-sdk/xai';
import { streamText, convertToCoreMessages } from 'ai';
import { NextRequest } from 'next/server';

// Optional: Give long responses / reasoning models more time
export const maxDuration = 90;

// Optional: Use Node.js runtime if you have edge-related streaming issues
// export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body (useChat sends { messages: [...] })
    const { messages } = await req.json();

    // Convert to the core message format expected by the SDK
    // This handles system/user/assistant/tool messages properly
    const coreMessages = convertToCoreMessages(messages);

    // Optional: Add your custom system prompt here if you want Grok to behave like a growth coach
    const systemPrompt = `
You are Grok, an expert AI growth coach built by xAI.
You specialize in helping startups, SaaS companies, and founders with:
- Growth strategies
- Reducing churn
- Increasing revenue & LTV
- User acquisition & marketing
- Product-led growth
- Metrics & analytics
- Fundraising & scaling advice

Be direct, insightful, data-driven, and occasionally witty.
Use markdown for formatting when helpful (tables, lists, bold, code blocks).
Keep answers actionable and concise unless the user asks for deep detail.
    `.trim();

    const result = await streamText({
      model: xai('grok-beta'), // ← Change this to your preferred model
      // Possible model names (as of early 2026):
      // 'grok-beta'
      // 'grok-4'
      // 'grok-4-fast-reasoning'
      // 'grok-4-vision' (if multimodal needed later)

      messages: coreMessages,
      system: systemPrompt, // ← comment out if you don't want a system prompt

      // Optional settings you can tune
      temperature: 0.7,
      maxTokens: 2048,
      // topP: 0.95,
      // frequencyPenalty: 0.1,
    });

    // Return in the exact streaming format that useChat expects
    return result.toDataStreamResponse({
      headers: {
        'x-vercel-ai-ui-message-stream': 'v1', // optional but helps some versions
      },
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);

    // Return a simple error response so the frontend doesn't hang forever
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