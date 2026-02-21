'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Nav event handler
function EmbeddedNavHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href');
      if (href) {
        console.log('Shopify navigate:', href);
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
    const checkAppBridge = () => {
      if ((window as any).shopify) {
        console.log('App Bridge initialized successfully:', (window as any).shopify);
        setIsEmbedded(true);
      } else {
        console.log('App Bridge not ready yet... retrying');
      }
    };

    // Immediate + retries (App Bridge can take 1–3 seconds)
    checkAppBridge();
    const interval = setInterval(checkAppBridge, 800); // Check every 800ms

    // Stop checking after 10 seconds max
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  console.log('AppBridgeWrapper mounted – Is embedded?', isEmbedded);

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