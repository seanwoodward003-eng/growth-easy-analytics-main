'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function AcquisitionChart() {
  const data = [
    { name: "Organic", value: 42, color: "#00ff88" },
    { name: "Paid Social", value: 28, color: "#ff00ff" },
    { name: "Email", value: 18, color: "#00ffff" },
    { name: "Referral", value: 12, color: "#ffff00" },
  ];

  return (
    <div className="bg-cyber-card/60 border-4 border-cyber-neon rounded-3xl p-6 md:p-10 shadow-2xl shadow-cyber-neon/50">
      <h2 className="text-3xl md:text-4xl font-bold text-cyber-neon glow-medium mb-8 text-center">
        Acquisition Channels
      </h2>
      <ResponsiveContainer width="100%" height={450}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={160}
            paddingAngle={4}
            dataKey="value"
            label={{ fill: '#e0e7ff', fontSize: 16, fontWeight: 'bold' }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="#0a0f2c" strokeWidth={5} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0f2c', border: '2px solid #00ffff', borderRadius: '12px' }}
            labelStyle={{ color: '#00ffff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={60}
            formatter={(value) => <span className="text-cyan-200 text-lg">{value}</span>}
            iconSize={16}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}