'use client';

import { useAppBridge } from '@shopify/app-bridge-react';

export function useAuthenticatedFetch() {
  const app = useAppBridge();

  return async (url: string, options: RequestInit = {}) => {
    const token = await app.getSessionToken();  // Fresh token every time
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };
}