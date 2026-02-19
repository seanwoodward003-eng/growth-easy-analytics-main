'use client';

import { useAppBridge } from '@shopify/app-bridge-react';

export function useAuthenticatedFetch() {
  const app = useAppBridge();

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const token = await app.getSessionToken(); // Fresh token

      // Create new init with Bearer header
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      const newInit = {
        ...init,
        headers,
      };

      return fetch(input, newInit);
    } catch (error) {
      console.error('Failed to get session token:', error);
      return fetch(input, init); // Fallback
    }
  };
}