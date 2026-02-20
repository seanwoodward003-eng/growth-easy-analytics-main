'use client';

import { ReactNode, useEffect, useState } from 'react';

export function AppBridgeWrapper({ children }: { children: ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.shopify) {
      setIsEmbedded(true);
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

      {children}
    </>
  );
}