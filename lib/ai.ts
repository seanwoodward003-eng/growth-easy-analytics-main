// lib/ai.ts
/**
 * Calls Grok API for a short, actionable growth insight.
 * Used by email reports and alerts (non-streaming).
 */
export async function getGrokInsight(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta', // or 'grok-4-1-fast-reasoning' if that's the current best
        messages: [
          {
            role: 'system',
            content: 'You are a concise, no-nonsense e-commerce growth coach. Give short, actionable advice in 2-4 sentences max. Focus on practical next steps.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
        stream: false, // Non-streaming for emails
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      return 'Unable to generate insight at this time — check your dashboard.';
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim();

    return insight || 'No insight available right now.';
  } catch (err) {
    console.error('Grok insight call failed:', err);
    return 'Error generating insight — please check dashboard for details.';
  }
}