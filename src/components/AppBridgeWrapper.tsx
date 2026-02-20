'use client';

import { ReactNode, useEffect } from 'react';

interface AppBridgeWrapperProps {
  children: ReactNode;
}

export function AppBridgeWrapper({ children }: AppBridgeWrapperProps) {
  // Optional: Log when App Bridge is ready (for debugging)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.shopify) {
      console.log('Shopify App Bridge is initialized');
    } else {
      console.log('Waiting for Shopify App Bridge...');
    }
  }, []);

  return (
    <>
      {/* Shopify Admin sidebar navigation – this will be injected when polaris.js loads */}
      <s-app-nav>
        <s-link href="/dashboard" rel="home">Dashboard</s-link>
        <s-link href="/dashboard/churn">Churn</s-link>
        <s-link href="/dashboard/revenue">Revenue</s-link>
        <s-link href="/dashboard/acquisition">Acquisition</s-link>
        <s-link href="/dashboard/retention">Retention</s-link>
        <s-link href="/dashboard/performance">Performance</s-link>
        <s-link href="/dashboard/ai-growth-coach">AI Growth Coach</s-link>
        <s-link href="/dashboard/settings">Settings</s-link>
        {/* Add About/Privacy/Pricing if you want them in Shopify sidebar too */}
        <s-link href="/about">About</s-link> 
        <s-link href="/privacy">Privacy</s-link> 
        <s-link href="/pricing">Upgrade</s-link> 
      </s-app-nav>

      {/* Main app content */}
      {children}
    </>
  );
}