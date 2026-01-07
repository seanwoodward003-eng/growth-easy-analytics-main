// hooks/useMetrics.ts
'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

const DEMO_DATA = {
  revenue: { total: 12700, trend: "+12%", history: { labels: [], values: [] } },
  churn: { rate: 3.2, at_risk: 18 },
  performance: { ratio: "3.4", ltv: 162, cac: 47 },
  acquisition: { top_channel: "Organic Search", acquisition_cost: 87 },
  retention: { rate: 68 },
  ai_insight: "Connect accounts for real insights.",
  shopify: { connected: false },
  ga4: { connected: false },
  hubspot: { connected: false },
};

export default function useMetrics() {
  const { data, error, isLoading, mutate } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 60000, // Refresh every minute when connected
    fallbackData: DEMO_DATA,
  });

  const metrics = data || DEMO_DATA;

  // Better connection detection
  const shopifyConnected = !!metrics.shopify?.connected;

  return {
    metrics,
    isLoading,
    isError: !!error,
    shopifyConnected,        // Use this in dashboard instead of guessing from revenue
    refresh: mutate,         // This will trigger fresh fetch
  };
}