'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Handler for Shopify nav events
function EmbeddedNavHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href');
      if (href) {
        console.log('Shopify navigate event:', href);
        router.push(href);
        event.preventDefault();
      }
    };

    document.addEventListener('shopify:navigate', handleNavigate);
    return () => document.removeEventListener('shopify:navigate', handleNavigate);
  }, [router]);

  return null;
}

export function AppBridgeWrapper({ children }: { children: ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Delay to give App Bridge script time to load
    const checkAppBridge = () => {
      const shopify = (window as any).shopify;
      console.log('App Bridge check:', {
        exists: !!shopify,
        version: shopify?.version,
        config: shopify?.config,
        full: shopify
      });
      setIsEmbedded(!!shopify);
    };

    // Check immediately + retry after 1s and 3s
    checkAppBridge();
    const timer1 = setTimeout(checkAppBridge, 1000);
    const timer2 = setTimeout(checkAppBridge, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  console.log('AppBridgeWrapper mounted – Is Shopify embedded?', isEmbedded);

  return (
    <>
      {isEmbedded && (
        <s-app-nav>
          <s-link href="/dashboard">Dashboard</s-link>
          <s-link href="/dashboard/churn">Churn</s-link>
          <s-link href="/dashboard/revenue">Revenue</s-link>
          <s-link href="/dashboard/acquisition">Acquisition</s-link>
          <s-link href="/dashboard/retention">Retention</s-link>
          <s-link href="/dashboard/performance">Performance</s-link>
          <s-link href="/dashboard/ai-growth-coach">AI Growth Coach</s-link>
          <s-link href="/dashboard/settings">Settings</s-link>
        </s-app-nav>
      )}

      <EmbeddedNavHandler />

      {children}
    </>
  );
}