'use client';

import { Line } from 'react-chartjs-2';

export default function ChurnChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Churn Rate %',
      data: [4.1, 3.8, 3.5, 3.7, 3.4, 3.2],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      tension: 0.4,
      fill: true,
    }]
  };

  return <Line data={data} options={{ responsive: true, plugins: { legend: { display: false }}, scales: { y: { max: 6 }}}}/>;
}