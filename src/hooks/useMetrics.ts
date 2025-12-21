'use client';

import useSWR from 'swr';

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

const fetcher = async (url: string) => {
  const res = await fetch(`${BACKEND_URL}${url}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const DEMO_DATA = {
  revenue: { total: 12700, trend: "+12% this month" },
  churn: { rate: 3.2, at_risk: 18 },
  acquisition: { top_channel: "Organic Search", cac: 87 },
  performance: { ratio: "3.4" },
  retention: { rate: 68 },
};

export default function useMetrics() {
  const { data, error, isLoading, mutate } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 30000,
    fallbackData: DEMO_DATA,
  });

  const metrics = data || DEMO_DATA;
  const isConnected = !error && data && !data.revenue.trend.includes('demo');

  return {
    metrics,
    isLoading,
    isError: error,
    isConnected,
    refresh: mutate,
  };
}