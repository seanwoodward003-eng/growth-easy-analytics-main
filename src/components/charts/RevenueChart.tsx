'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const allData = {
  '7': [
    { date: 'Dec 9', value: 11800 },
    { date: 'Dec 10', value: 12000 },
    { date: 'Dec 11', value: 12200 },
    { date: 'Dec 12', value: 12400 },
    { date: 'Dec 13', value: 12600 },
    { date: 'Dec 14', value: 12700 },
    { date: 'Dec 15', value: 12700 },
  ],
  '30': [
    { date: 'Nov 16', value: 10500 },
    { date: 'Nov 23', value: 11000 },
    { date: 'Nov 30', value: 11500 },
    { date: 'Dec 7', value: 12000 },
    { date: 'Dec 14', value: 12700 },
  ],
  '90': [
    { date: 'Sep', value: 9000 },
    { date: 'Oct', value: 10500 },
    { date: 'Nov', value: 11500 },
    { date: 'Dec', value: 12700 },
  ],
} as const;

const currency = '£';

export function RevenueChart() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const data = allData[range] ?? [];

  return (
    <div className="bg-cyber-card/60 border-4 border-cyber-neon rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyber-neon/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h3 className="text-3xl md:text-4xl font-bold text-cyber-neon glow-medium text-center md:text-left">
          Revenue Trend
        </h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '7' | '30' | '90')}
          className="mt-4 md:mt-0 bg-transparent border-2 border-cyber-neon rounded-full px-6 py-3 text-cyan-300 text-lg glow-soft"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="date" stroke="#00ffff" tick={{ fill: '#00ffff' }} />
          <YAxis stroke="#00ffff" tick={{ fill: '#00ffff' }} tickFormatter={(value) => `${currency}${value.toLocaleString()}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #00ffff', borderRadius: '12px' }}
            formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#00ffff' }}
          />
          <Line type="monotone" dataKey="value" stroke="#00ffff" strokeWidth={5} dot={{ fill: '#00ffff', r: 8 }} activeDot={{ r: 12 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}