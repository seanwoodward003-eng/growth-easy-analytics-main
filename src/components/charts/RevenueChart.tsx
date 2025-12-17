'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const demoData = {
  '7': [
    { date: 'Dec 9', value: 11800 },
    { date: 'Dec 10', value: 12000 },
    { date: 'Dec 11', value: 12200 },
    { date: 'Dec 12', value: 12400 },
    { date: 'Dec 13', value: 12600 },
    { date: 'Dec 14', value: 12800 },
    { date: 'Dec 15', value: 13000 },
  ],
  '30': [
    { date: 'Nov 16', value: 10500 },
    { date: 'Nov 23', value: 11000 },
    { date: 'Nov 30', value: 11500 },
    { date: 'Dec 7', value: 12000 },
    { date: 'Dec 14', value: 12800 },
  ],
  '90': [
    { date: 'Oct', value: 9800 },
    { date: 'Nov', value: 11000 },
    { date: 'Dec', value: 13000 },
  ],
} as const;

// Define mutable types for Recharts
type RevenueDataPoint = { date: string; value: number };
type RevenueData = RevenueDataPoint[];

const currency = '£';

export function RevenueChart() {
  const [range, setRange] = useState<'7' | '30' | '90'>('7');

  // Create a mutable copy to satisfy Recharts
  const data: RevenueData = [...demoData[range]] as RevenueData;

  return (
    <div className="bg-cyber-card/60 border-4 border-cyan-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyan-500/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 glow-medium text-center md:text-left">
          Revenue Trend
        </h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '7' | '30' | '90')}
          className="mt-4 md:mt-0 bg-transparent border-2 border-cyan-500 rounded-full px-6 py-3 text-cyan-300 text-lg"
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
          <YAxis 
            stroke="#00ffff" 
            tick={{ fill: '#00ffff' }} 
            tickFormatter={(value) => `${currency}${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #00ffff', borderRadius: '12px' }}
            formatter={(value: number) => `${currency}${value.toLocaleString()}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#00ffff" 
            strokeWidth={6} 
            dot={{ fill: '#00ffff', r: 8 }} 
            activeDot={{ r: 12 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}