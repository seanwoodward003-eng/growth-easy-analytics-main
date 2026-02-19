'use client';

// No useAppBridge needed — use global window.shopify from CDN
export function useAuthenticatedFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      // Get fresh session token from Shopify CDN global
      const token = await window.shopify.idToken();

      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      const newInit = {
        ...init,
        headers,
      };

      return fetch(input, newInit);
    } catch (error) {
      console.error('Failed to get session token:', error);
      // Fallback to plain fetch (for local dev or if CDN not loaded)
      return fetch(input, init);
    }
  };
}