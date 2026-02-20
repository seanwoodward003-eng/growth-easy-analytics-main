'use client';

import { ReactNode, useEffect, useState } from 'react';

interface AppBridgeWrapperProps {
  children: ReactNode;
}

export function AppBridgeWrapper({ children }: AppBridgeWrapperProps) {
  const [ready, setReady] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const embedded = !!window.shopify;  // App Bridge only exists in iframe
      setIsEmbedded(embedded);

      if (!embedded) {
        // Standalone: render immediately (no need to wait for Shopify scripts)
        console.log('Standalone mode detected – rendering directly');
        setReady(true);
        return;
      }

      // Embedded: poll for ready
      const checkReady = () => {
        if (window.shopify && document.querySelector('s-app-nav')) {
          console.log('Embedded: Polaris & App Bridge ready');
          setReady(true);
        }
      };

      checkReady();
      const interval = setInterval(checkReady, 500);

      const timeout = setTimeout(() => {
        console.warn('Embedded timeout – forcing render');
        setReady(true);
      }, 15000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!ready) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading Shopify Admin integration...</div>;
  }

  return (
    <>
      {isEmbedded && (
        <s-app-nav>
          <s-link href="/dashboard" rel="home">Dashboard</s-link>
          <s-link href="/dashboard/churn">Churn</s-link>
          <s-link href="/dashboard/revenue">Revenue</s-link>
          <s-link href="/dashboard/acquisition">Acquisition</s-link>
          <s-link href="/dashboard/retention">Retention</s-link>
          <s-link href="/dashboard/performance">Performance</s-link>
          <s-link href="/dashboard/ai-growth-coach">AI Growth Coach</s-link>
          <s-link href="/dashboard/settings">Settings</s-link>
        </s-app-nav>
      )}

      {children}
    </>
  );
}