// app/api/generate-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRow, getRows } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  // Current + last 7 days history for mini charts
  const current = await getRow<any>(
    'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  const history = await getRows<any>(
    'SELECT date, churn_rate, revenue, aov FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 7',
    [userId]
  );

  const chartData = history.reverse().map((h, i) => ({
    name: `Day ${i + 1}`,
    value: h.churn_rate || h.revenue || h.aov || 0,
  }));

  const currentSummary = current
    ? `Current: Revenue £${current.revenue}, Churn ${current.churn_rate}%, At-risk ${current.at_risk}, AOV £${current.aov?.toFixed(2)}, Repeat ${current.repeat_rate?.toFixed(1)}%`
    : 'No data';

  const prompt = `You are GrowthEasy AI. Current metrics: ${currentSummary}.
Generate 4 insights (1 sentence each). For each:
- Highlight anomaly/trend vs previous
- Estimate £ impact/mo
- Suggest 1 action
Format as JSON array of objects: [{"text": "...", "impact": 2400, "historical": "Last month 2.1% — now 3.2%"}]`;

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
        max_tokens: 600,
      }),
    });

    if (!resp.ok) throw new Error('Grok failed');
    const data = await resp.json();
    let insights = JSON.parse(data.choices[0].message.content);

    // Attach chart data to churn insight
    insights = insights.map((ins: any) => ({
      ...ins,
      chartData: ins.text.toLowerCase().includes('churn') ? chartData : undefined,
    }));

    return NextResponse.json({ insights });
  } catch (e) {
    return NextResponse.json({ insights: [] });
  }
}