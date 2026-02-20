// src/types/shopify.d.ts

declare global {
  interface Window {
    shopify: {
      idToken: () => Promise<string>; // Returns the session token as string
      // Add other methods if needed, e.g. showToast, etc.
    };
  }
}

export {};
