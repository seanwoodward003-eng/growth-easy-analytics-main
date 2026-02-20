'use client';

import { Provider } from '@shopify/app-bridge-react';  // ← FIXED: use Provider
import { NavigationMenu } from '@shopify/app-bridge-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function AppBridgeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostParam = params.get('host');
    if (hostParam) {
      setHost(hostParam);
    }
  }, []);

  if (!host) {
    return <div className="flex items-center justify-center h-screen text-cyan-300">Loading app...</div>;
  }

  const navigationItems = [
    { label: 'Dashboard', destination: '/dashboard' },
    { label: 'Churn', destination: '/dashboard/churn' },
    { label: 'Revenue', destination: '/dashboard/revenue' },
    { label: 'Acquisition', destination: '/dashboard/acquisition' },
    { label: 'Retention', destination: '/dashboard/retention' },
    { label: 'Performance', destination: '/dashboard/performance' },
    { label: 'AI Growth Coach', destination: '/dashboard/ai-growth-coach' },
    { label: 'Settings', destination: '/dashboard/settings' },
  ];

  return (
    <Provider config={{ apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '', host }}>
      <NavigationMenu
        navigationItems={navigationItems.map(item => ({
          label: item.label,
          destination: item.destination,
          match: pathname.startsWith(item.destination) ? 'exact' : 'none',
        }))}
      />
      {children}
    </Provider>
  );
}