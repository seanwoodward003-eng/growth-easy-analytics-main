'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// The handler component (listens for shopify:navigate events from s-link clicks)
function EmbeddedNavHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href');
      if (href) {
        console.log('Shopify navigate event:', href);
        router.push(href);           // Navigate client-side with Next.js
        event.preventDefault();      // Prevent default full page reload
      }
    };

    document.addEventListener('shopify:navigate', handleNavigate);

    return () => {
      document.removeEventListener('shopify:navigate', handleNavigate);
    };
  }, [router]);

  return null;  // Invisible — no UI output
}

export function AppBridgeWrapper({ children }: { children: ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (isEmbedded) return; // Already detected — no need to check

    let attempts = 0;
    const maxAttempts = 12; // ~8 seconds total
    const intervalMs = 700;

    const checkAppBridge = () => {
      attempts++;
      const shopify = (window as any).shopify;

      if (shopify) {
        console.log('✅ SUCCESS - App Bridge initialized!', {
          version: shopify.version,
          config: shopify.config,
          full: shopify
        });
        setIsEmbedded(true);
        clearInterval(timer);
        return;
      }

      console.log(`App Bridge check ${attempts}/${maxAttempts} - not ready`);

      if (attempts >= maxAttempts) {
        console.log('App Bridge timeout after 8s - assuming not embedded or slow load');
        clearInterval(timer);
      }
    };

    const timer = setInterval(() => {
      if (checkAppBridge()) {
        clearInterval(timer);
      }
    }, intervalMs);

    // Initial check right away
    checkAppBridge();

    return () => clearInterval(timer);
  }, [isEmbedded]);

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