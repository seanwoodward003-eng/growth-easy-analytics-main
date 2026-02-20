'use client';

import { ReactNode, useEffect, useState } from 'react';

interface AppBridgeWrapperProps {
  children: ReactNode;
}

export function AppBridgeWrapper({ children }: AppBridgeWrapperProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      if (window.shopify && document.querySelector('s-app-nav')) {  // polaris.js registers elements
        console.log('Polaris & App Bridge ready – rendering nav');
        setReady(true);
      }
    };

    checkReady();  // immediate check
    const interval = setInterval(checkReady, 500);  // poll every 0.5s (up to ~10s)

    // Timeout after 15s to avoid infinite wait
    const timeout = setTimeout(() => {
      console.warn('Polaris/App Bridge not ready after 15s – rendering anyway');
      setReady(true);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading Shopify Admin integration...</div>;
  }

  return (
    <>
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

      {children}
    </>
  );
}