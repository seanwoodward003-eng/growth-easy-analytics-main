'use client';

export function useAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}) => {
    try {
      const token = await window.shopify.idToken();  // Current CDN way for session token
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    } catch (error) {
      console.error('Failed to get session token:', error);
      throw error;
    }
  };
}