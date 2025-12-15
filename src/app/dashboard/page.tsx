'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from "@/components/ui/MetricCard";

const revenueData = [
  { week: 'Week 1', value: 11500 },
  { week: 'Week 2', value: 12000 },
  { week: 'Week 3', value: 12400 },
  { week: 'Week 4', value: 12700 },
];

export default function Dashboard() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#0a0f2c', minHeight: '100vh', color: '#ffffff' }}>
      <p style={{ fontSize: '28px', color: '#00ffff', marginBottom: '60px' }}>
        AI: Demo mode – connect accounts for real data.
      </p>

      <h2 className="glow-title" style={{ fontSize: '80px', marginBottom: '30px' }}>
        Your Profile
      </h2>
      <p style={{ fontSize: '40px', marginBottom: '40px' }}>
        seanwoodward2023@gmail.com
      </p>
      <button className="connect-btn" style={{ marginBottom: '80px' }}>
        Logout
      </button>

      <h2 className="glow-title" style={{ fontSize: '80px', marginBottom: '40px' }}>
        Connect Your Accounts
      </h2>
      <p style={{ fontSize: '36px', marginBottom: '60px' }}>
        Shopify, GA4, HubSpot – real data powers AI insights.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '60px', flexWrap: 'wrap' }}>
        <button className="connect-btn">Connect Shopify</button>
        <button className="connect-btn">Connect GA4</button>
        <button className="connect-btn">Connect HubSpot</button>
      </div>

      <p style={{ fontSize: '32px', color: '#00ffff', marginBottom: '80px' }}>
        Checking connections...
      </p>

      {/* Revenue Chart */}
      <div className="chart-container" style={{ maxWidth: '900px', margin: '0 auto 100px auto' }}>
        <h3 style={{ fontSize: '48px', color: '#00ffff', marginBottom: '30px' }}>Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData}>
            <CartesianGrid stroke="#334455" />
            <XAxis dataKey="week" stroke="#00ffff" />
            <YAxis stroke="#00ffff" />
            <Tooltip contentStyle={{ background: '#0a0f2c', border: '2px solid #00ffff' }} />
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

      {/* Metric Cards - All original content preserved */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <MetricCard
          title="Revenue"
          value="£12,700"
          subtitle="+6% (demo)"
          subtitleColor="#00ff00"
        />

        <MetricCard
          title="Churn Rate"
          value="3.2%"
          subtitle="18 at risk"
          subtitleColor="#ffff00"
        />

        <MetricCard
          title="LTV:CAC"
          value="3.4:1"
          subtitle="Healthy"
          subtitleColor="#00ff00"
        />
      </div>
    </div>
  );
}