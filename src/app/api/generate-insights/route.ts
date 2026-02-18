import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRow, getRows } from '@/lib/db';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.user.id;

  // Get latest metrics row
  const current = await getRow<any>(
    'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    [userId]
  );

  // Last 7 days for charts/trends
  const history = await getRows<any>(
    'SELECT date, churn_rate, revenue, aov FROM metrics WHERE user_id = ? ORDER BY date DESC LIMIT 7',
    [userId]
  );

  const chartData = history.reverse().map((h, i) => ({
    name: `Day ${i + 1}`,
    value: h.churn_rate || h.revenue || h.aov || 0,
  }));

  const currentSummary = current
    ? `Current: Revenue £${current.revenue || 0}, Churn ${current.churn_rate || 0}%, At-risk ${current.at_risk || 0}, AOV £${(current.aov || 0).toFixed(2)}, Repeat ${current.repeat_rate?.toFixed(1) || 0}%`
    : 'No metrics data available yet. This appears to be a brand new store with zero sales, orders, or activity so far.';

  const prompt = `You are GrowthEasy AI, an expert Shopify growth coach powered by Grok.

Store metrics right now: ${currentSummary}.

Generate exactly 4 concise, helpful insights (1 sentence each) tailored to the current situation.
- If data is zero, very low, or missing: focus on early-stage setup advice, what to monitor first, quick wins for new stores, testing ideas, or common beginner opportunities.
- If trends exist: highlight anomalies or changes, estimate realistic £ monthly impact, suggest 1 clear next action.
- Always be encouraging, realistic, and actionable — even for brand new stores.

Format strictly as a JSON array of objects — nothing else before or after:
[
  {"text": "insight sentence here", "impact": number or null, "historical": "comparison string or null"}
]

Return ONLY the JSON array.`;

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

    if (!resp.ok) {
      throw new Error(`Grok API error: ${resp.status}`);
    }

    const data = await resp.json();
    const rawContent = data.choices[0].message.content.trim();

    let insights;
    try {
      insights = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error('JSON parse failed:', rawContent);
      throw new Error('Invalid JSON from Grok');
    }

    // Attach chart data to relevant insights (e.g. churn)
    insights = insights.map((ins: any) => ({
      ...ins,
      chartData: ins.text.toLowerCase().includes('churn') ? chartData : undefined,
    }));

    return NextResponse.json({ insights });
  } catch (e) {
    console.error('Insights generation failed:', e);
    return NextResponse.json({ 
      insights: [], 
      error: 'Failed to generate insights — data sync or AI service issue'
    });
  }
}