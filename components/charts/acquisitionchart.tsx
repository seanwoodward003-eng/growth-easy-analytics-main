'use client';

import { Doughnut } from 'react-chartjs-2';

export default function AcquisitionChart() {
  const data = {
    labels: ['Organic', 'Paid Social', 'Email', 'Referral'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: ['#00ffff', '#8b5cf6', '#10b981', '#f59e0b'],
    }]
  };

  return <Doughnut data={data} options={{ responsive: true }} />;
}