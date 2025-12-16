'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { cohort: "Jan", "30d": 68, "60d": 51, "90d": 42 },
  { cohort: "Feb", "30d": 71, "60d": 54, "90d": 45 },
  { cohort: "Mar", "30d": 66, "60d": 49, "90d": 40 },
  { cohort: "Apr", "30d": 70, "60d": 55, "90d": 47 },
];

export function RetentionChart() {
  return (
    <div className="bg-cyber-card/60 border-4 border-purple-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-purple-500/50">
      <h2 className="text-3xl md:text-4xl font-bold text-purple-400 glow-medium mb-8 text-center">
        Customer Retention Cohorts
      </h2>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334455" />
          <XAxis dataKey="cohort" stroke="#9b59b6" />
          <YAxis stroke="#9b59b6" tickFormatter={(value) => `${value}%`} />
          <Tooltip contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #9b59b6', borderRadius: '12px' }} formatter={(value: number) => `${value}%`} />
          <Legend verticalAlign="bottom" height={60} formatter={(value) => <span className="text-cyan-200 text-lg">{value}</span>} />
          <Bar dataKey="30d" stackId="a" fill="#00ff88" />
          <Bar dataKey="60d" stackId="a" fill="#9b59b6" />
          <Bar dataKey="90d" stackId="a" fill="#ff00ff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}