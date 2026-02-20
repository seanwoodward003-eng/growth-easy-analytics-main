'use client';

import { ReactNode, useEffect, useState } from 'react';

export function AppBridgeWrapper({ children }: { children: ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Is Shopify embedded?', !!window.shopify);
      setIsEmbedded(!!window.shopify);
    }
  }, []);

  return (
    <>
      {/* Debug div – always show this in embedded to confirm wrapper mounts */}
      {isEmbedded && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 9999,
          fontSize: '16px'
        }}>
          DEBUG: Embedded detected – wrapper mounted
        </div>
      )}

      {/* Shopify nav */}
      {isEmbedded && (
        <s-app-nav>
          <s-link href="/dashboard">Dashboard</s-link>
          <s-link href="/dashboard/churn">Churn</s-link>
          {/* ... your full list */}
        </s-app-nav>
      )}

      {children}
    </>
  );
}