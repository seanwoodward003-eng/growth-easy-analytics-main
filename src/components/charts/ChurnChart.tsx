'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const demoData = {
  '7': [
    { date: 'Dec 9', rate: 4.2 },
    { date: 'Dec 10', rate: 4.0 },
    { date: 'Dec 11', rate: 3.8 },
    { date: 'Dec 12', rate: 3.6 },
    { date: 'Dec 13', rate: 3.5 },
    { date: 'Dec 14', rate: 3.3 },
    { date: 'Dec 15', rate: 3.2 },
  ],
  '30': [
    { date: 'Nov 16', rate: 4.5 },
    { date: 'Nov 23', rate: 4.3 },
    { date: 'Nov 30', rate: 4.1 },
    { date: 'Dec 7', rate: 3.8 },
    { date: 'Dec 14', rate: 3.2 },
  ],
  '90': [
    { date: 'Oct', rate: 4.8 },
    { date: 'Nov', rate: 4.2 },
    { date: 'Dec', rate: 3.2 },
  ],
};

export function ChurnChart() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const data = demoData[range];

  return (
    <div className="bg-cyber-card/60 border-4 border-red-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-red-500/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h3 className="text-3xl md:text-4xl font-bold text-red-400 glow-medium text-center md:text-left">
          Churn Rate Trend
        </h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '7' | '30' | '90')}
          className="mt-4 md:mt-0 bg-transparent border-2 border-red-500 rounded-full px-6 py-3 text-red-300 text-lg glow-soft"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="date" stroke="#e74c3c" />
          <YAxis stroke="#e74c3c" tickFormatter={(value) => `${value}%`} />
          <Tooltip contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #e74c3c', borderRadius: '12px' }} formatter={(value: number) => `${value}%`} />
          <Line type="monotone" dataKey="rate" stroke="#e74c3c" strokeWidth={6} dot={{ fill: '#e74c3c', r: 8 }} activeDot={{ r: 12 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}