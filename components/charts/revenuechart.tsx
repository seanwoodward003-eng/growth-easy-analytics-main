'use client';

import { Line } from 'react-chartjs-2';

export default function RevenueChart() {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Revenue',
      data: [11500, 12000, 12400, 12700],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.4,
      fill: true,
    }]
  };

  return <Line data={data} options={{ responsive: true, plugins: { legend: { display: false }}}} />;
}