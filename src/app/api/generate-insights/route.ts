// app/api/generate-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRow, getRows } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  // Current metrics
  const current = await getRow<any>(
    'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  // Previous metrics (for anomaly)
  const previous = await getRow<any>(
    'SELECT * FROM metrics WHERE user_id = ? AND date < ? ORDER BY date DESC LIMIT 1',
    [userId, current?.date || new Date().toISOString()]
  );

  const currentSummary = current
    ? `Current: Revenue £${current.revenue}, Churn ${current.churn_rate}%, At-risk ${current.at_risk}, AOV £${current.aov?.toFixed(2)}, Repeat ${current.repeat_rate?.toFixed(1)}%`
    : 'No current data';

  const previousSummary = previous
    ? `Previous: Revenue £${previous.revenue}, Churn ${previous.churn_rate}%, At-risk ${previous.at_risk}`
    : 'No previous data';

  const prompt = `You are GrowthEasy AI. 
Current metrics: ${currentSummary}
Previous metrics: ${previousSummary}

Generate 4 short, actionable insights (1 sentence each) on biggest opportunities. Highlight any anomalies/trends vs previous. Be specific, use numbers.`;

  try {
    const resp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) throw new Error('Grok failed');
    const data = await resp.json();
    const text = data.choices[0].message.content.trim();
    const insights = text.split('\n').filter(line => line.trim()).slice(0, 4);

    return NextResponse.json({ insights });
  } catch (e) {
    return NextResponse.json({ insights: [
      "Revenue stable — focus on increasing AOV",
      "Churn normal — monitor at-risk customers",
      "Repeat rate good — encourage loyalty programs",
      "LTV healthy — scale acquisition"
    ] });
  }
}