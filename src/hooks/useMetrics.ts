'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

const EMPTY_STATE = {
  revenue: { total: 0, trend: '0%', history: { labels: [], values: [] } },
  churn: { rate: 0, at_risk: 0 },
  performance: { ratio: '0', ltv: 0, cac: 0 },
  acquisition: { top_channel: '—', acquisition_cost: 0 },
  retention: { rate: 0 },
  ai_insight: 'Connect your store to see real insights.',
  shopify: { connected: false },
  ga4: { connected: false },
  hubspot: { connected: false },
};

export default function useMetrics() {
  const { data, error, isLoading, mutate } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 60000,
  });

  // Logged-in users always get real data or clean zeros — NEVER demo/fake data
  const metrics = data || EMPTY_STATE;

  const shopifyConnected = !!metrics.shopify?.connected;
  const ga4Connected = !!metrics.ga4?.connected;
  const hubspotConnected = !!metrics.hubspot?.connected;
  const hasRealData = shopifyConnected || ga4Connected || hubspotConnected;

  return {
    metrics,
    isLoading,
    isError: !!error,
    shopifyConnected,
    ga4Connected,
    hubspotConnected,
    hasRealData,
    refresh: mutate,
  };
}