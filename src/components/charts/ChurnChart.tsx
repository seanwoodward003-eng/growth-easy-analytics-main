'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [ /* your churn data */ ];

export function ChurnChart() {
  return (
    <div className="bg-cyber-card/80 border-4 border-red-500 rounded-3xl p-8 shadow-2xl shadow-red-500/50">
      <h3 className="text-4xl font-bold text-red-400 mb-8 text-center">Churn Rate Trend</h3>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="week" stroke="#e74c3c" />
          <YAxis stroke="#e74c3c" />
          <Tooltip contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #e74c3c' }} />
          <Line type="monotone" dataKey="rate" stroke="#e74c3c" strokeWidth={6} dot={{ fill: '#e74c3c' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}