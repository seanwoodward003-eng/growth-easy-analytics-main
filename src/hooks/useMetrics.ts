'use client'; // REQUIRED for client-side hooks like useSWR

import useSWR from 'swr';

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

const fetcher = async (url: string) => {
  const res = await fetch(`${BACKEND_URL}${url}`, {
    credentials: 'include', // sends JWT cookies for auth
  });

  if (!res.ok) {
    const err = new Error('Failed to fetch metrics');
    (err as any).status = res.status;
    throw err;
  }

  return res.json();
};

export default function useMetrics() {
  const { data, error, isLoading, mutate } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 30000, // refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    fallbackData: {
      revenue: { total: 12700, trend: "+6%" },
      churn: { rate: 3.2, at_risk: 18 },
      acquisition: { cac: 87, top_channel: "Organic" },
      performance: { ratio: "3.4" },
      retention: { rate: 68 },
      ai_insight: "Connect accounts for real insights.",
    },
  });

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate, // manual refresh if needed
  };
}