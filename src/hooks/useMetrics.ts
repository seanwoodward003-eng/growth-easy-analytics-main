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
      console.error('[useMetrics] Fetch failed:', res.status, await res.text());
      throw new Error('Failed to fetch metrics');
    }

    const json = await res.json();
    console.log('[useMetrics] Raw API response:', json); // DEBUG: see what API sends

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

  // Use real data if available, fallback to empty
  const metrics = data && !('error' in data) ? data : EMPTY_STATE;

  // Derive connected flags from the actual API response shape
  // Your API returns 'connections' object with shopify/ga4/hubspot
  const connections = metrics.connections || EMPTY_STATE;
  const shopifyConnected = !!connections.shopify;
  const ga4Connected = !!connections.ga4;
  const hubspotConnected = !!connections.hubspot;

  // hasRealData: use real logic based on data presence
  const hasRealData = !!metrics.revenue?.total || !!metrics.orders?.length || shopifyConnected;

  const refresh = () => mutate(undefined, { revalidate: true });

  return {
    metrics,
    isLoading,
    isError: !!error || ('error' in metrics),
    shopifyConnected,
    ga4Connected,
    hubspotConnected,
    hasRealData,
    refresh,
  };
}