'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// The handler component
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

    return () => {
      document.removeEventListener('shopify:navigate', handleNavigate);
    };
  }, [router]);

  return null;  // Invisible
}

export function AppBridgeWrapper({ children }: { children: ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('AppBridgeWrapper mounted – Is Shopify embedded?', !!window.shopify);
      setIsEmbedded(!!window.shopify);
    }
  }, []);

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
          {/* Add About/Privacy/Upgrade if you want them in sidebar */}
        </s-app-nav>
      )}

      {/* Add the nav handler here – it listens for clicks on s-link */}
      <EmbeddedNavHandler />

      {children}
    </>
  );
}