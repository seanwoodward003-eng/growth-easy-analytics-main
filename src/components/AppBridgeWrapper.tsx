'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function EmbeddedNavHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href');
      if (href) {
        console.log('Shopify nav event:', href);
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
    let attempts = 0;
    const maxAttempts = 15; // ~10 seconds total
    const intervalMs = 700;

    const checkAppBridge = () => {
      attempts++;
      const shopify = (window as any).shopify;

      if (shopify) {
        console.log('✅ App Bridge READY!', {
          version: shopify.version,
          config: shopify.config,
          full: shopify
        });
        setIsEmbedded(true);
        return true; // stop interval
      } else {
        console.log(`App Bridge attempt ${attempts}/${maxAttempts} - not ready yet`);
      }

      if (attempts >= maxAttempts) {
        console.log('App Bridge timeout - giving up after 10s');
      }
      return false;
    };

    const timer = setInterval(() => {
      if (checkAppBridge()) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
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