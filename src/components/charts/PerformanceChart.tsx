'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { metric: "LTV", value: 162 },
  { metric: "CAC", value: 47 },
  { metric: "Ratio", value: 3.4 },
];

export function PerformanceChart() {
  return (
    <div className="bg-cyber-card/60 border-4 border-yellow-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-yellow-500/50">
      <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 glow-medium mb-8 text-center">
        Performance Metrics
      </h2>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="metric" stroke="#f1c40f" />
          <YAxis stroke="#f1c40f" />
          <Tooltip contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #f1c40f', borderRadius: '12px' }} />
          <Bar dataKey="value" fill="#f1c40f" radius={[20, 20, 0, 0]} barSize={80} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}