'use client';

import { ReactNode, useEffect, useState } from 'react';

interface AppBridgeWrapperProps {
  children: ReactNode;
}

export function AppBridgeWrapper({ children }: AppBridgeWrapperProps) {
  const [ready, setReady] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Quick check: Shopify App Bridge only exists in embedded iframe
    const embedded = !!window.shopify;
    setIsEmbedded(embedded);

    if (!embedded) {
      // Standalone browser: no need to wait — render right away
      console.log('Standalone mode: Rendering immediately (no Shopify context)');
      setReady(true);
      return;
    }

    // Embedded: Poll for full readiness (polaris.js + App Bridge)
    const checkReady = () => {
      if (window.shopify && document.querySelector('s-app-nav')) {
        console.log('Embedded ready: Polaris registered, App Bridge active');
        setReady(true);
      }
    };

    checkReady(); // Check once immediately
    const interval = setInterval(checkReady, 500);

    const timeout = setTimeout(() => {
      console.warn('Embedded timeout: Forcing render anyway');
      setReady(true);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: 'white', 
        background: '#0a0f2c', 
        minHeight: '100vh' 
      }}>
        Loading Shopify Admin integration...
      </div>
    );
  }

  return (
    <>
      {/* Only render Shopify-specific nav in embedded mode */}
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