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
  connections: { shopify: false, ga4: false, hubspot: false },
};

// TEMP FAKE DATA - comment out after test
const FAKE_METRICS = {
  revenue: { total: 123456, average_order_value: 89.50, trend: '+18%', history: { labels: ['Jan', 'Feb', 'Mar'], values: [80000, 95000, 123000] } },
  churn: { rate: 12, at_risk: 45 },
  performance: { ratio: '3.2', ltv: 450, cac: 140 },
  acquisition: { top_channel: 'Google Ads', acquisition_cost: 120 },
  retention: { rate: 68, repeat_purchase_rate: 42 },
  returning_customers_ltv: 1200,
  ltv_breakdown: { one_time: 600000, returning: 636000 },
  cohort_retention: { data: [] },
  store_health_score: 82,
  ai_insight: 'Fake data loaded for test - real data coming soon',
  connections: { shopify: true, ga4: true, hubspot: false },
  // Added keys to match pages (Acquisition, Churn, etc.)
  traffic: { sessions: 15000, bounceRate: 45.5 },
  ltvNew: 300,
  ltvReturning: 700,
  email: { openRate: 28.7 },  // fixes Churn page build error
};

export default function useMetrics() {
  const authenticatedFetch = useAuthenticatedFetch();

  // TEMP: Force fake data (uncomment real fetch after test)
  const data = FAKE_METRICS;
  const error = null;
  const isLoading = false;

  /* Real fetch - comment out for fake test
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
    console.log('[useMetrics] Raw API response:', json); // keep for debugging real API

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
  */

  const metrics = data || EMPTY_STATE;

  const connections = metrics.connections || EMPTY_STATE.connections;
  const shopifyConnected = !!connections.shopify;
  const ga4Connected = !!connections.ga4;
  const hubspotConnected = !!connections.hubspot;

  const hasRealData = !!metrics.revenue?.total || shopifyConnected;

  const refresh = () => {}; // dummy for fake mode

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