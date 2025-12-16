'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [ /* your data */ ];

export function RevenueChart() {
  return (
    <div className="bg-cyber-card/80 border-4 border-cyber-neon rounded-3xl p-8 shadow-2xl shadow-cyber-neon/50">
      <h3 className="text-4xl font-bold text-cyber-neon mb-8 text-center">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="week" stroke="#00ffff" />
          <YAxis stroke="#00ffff" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #00ffff', borderRadius: '12px' }}
            labelStyle={{ color: '#00ffff' }}
          />
          <Line type="monotone" dataKey="value" stroke="#00ffff" strokeWidth={6} dot={{ fill: '#00ffff', r: 8 }} activeDot={{ r: 12 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}