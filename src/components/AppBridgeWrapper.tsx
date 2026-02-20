'use client';

import { ReactNode } from 'react';

export function AppBridgeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* This populates the Shopify Admin left sidebar navigation */}
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