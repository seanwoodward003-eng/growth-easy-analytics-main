'use client';

import useSWR from 'swr';
import { useAuthenticatedFetch } from '@/lib/authenticatedFetch';

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
  const authenticatedFetch = useAuthenticatedFetch();

  const fetcher = async (url: string) => {
    const res = await authenticatedFetch(url, {
      credentials: 'include',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[useMetrics] Fetch failed:', res.status, errText);
      throw new Error('Failed to fetch metrics');
    }

    const json = await res.json();

    // DEBUG LOG YOU ASKED FOR
    console.log('[useMetrics] API sent this:', JSON.stringify(json));

    return json;
  };

  const { data, error, isLoading, mutate } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 30000,
    revalidateOnMount: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    focusThrottleInterval: 5000,
  });

  const metrics = data || EMPTY_STATE;

  const shopifyConnected = !!metrics.shopify?.connected;
  const ga4Connected = !!metrics.ga4?.connected;
  const hubspotConnected = !!metrics.hubspot?.connected;
  const hasRealData = shopifyConnected || ga4Connected || hubspotConnected;

  const refresh = () => mutate(undefined, { revalidate: true });

  return {
    metrics,
    isLoading,
    isError: !!error,
    shopifyConnected,
    ga4Connected,
    hubspotConnected,
    hasRealData,
    refresh,
  };
} 