'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const allData = {
  '30': [
    { month: "Nov 16-30", cost: 95 },
    { month: "Dec 1-15", cost: 87 },
  ],
  '90': [
    { month: "Oct", cost: 102 },
    { month: "Nov", cost: 95 },
    { month: "Dec", cost: 87 },
  ],
} as const;

export function CostTrendChart() {
  const [range, setRange] = useState<'30' | '90'>('30');
  const data = allData[range] ?? [];

  return (
    <div className="bg-cyber-card/60 border-4 border-purple-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-purple-500/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-400 glow-medium text-center md:text-left">
          Acquisition Cost Trend
        </h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '30' | '90')}
          className="mt-4 md:mt-0 bg-transparent border-2 border-purple-500 rounded-full px-6 py-3 text-purple-300 text-lg"
        >
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="month" stroke="#9b59b6" />
          <YAxis stroke="#9b59b6" tickFormatter={(value) => `£${value}`} />
          <Tooltip contentStyle={{ background: '#0a0f2c', border: '2px solid #9b59b6' }} />
          <Area type="monotone" dataKey="cost" stroke="#9b59b6" fill="#9b59b6" fillOpacity={0.4} strokeWidth={5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}