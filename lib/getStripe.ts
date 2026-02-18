'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Tell TypeScript that window.Stripe exists after the script loads
declare global {
  interface Window {
    Stripe?: (publishableKey: string) => Stripe | null;
  }
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  // Never run on server
  if (typeof window === 'undefined') {
    console.warn('[getStripe] Called on server - returning null');
    return null;
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error('[getStripe] Publishable key is missing in client bundle');
    return null;
  }

  // Only initialize once
  if (!stripePromise) {
    console.log('[getStripe] Initializing Stripe.js with key length:', key.length);

    stripePromise = loadStripe(key).catch((err) => {
      console.error('[getStripe] loadStripe failed:', err?.message || err);
      return null;
    });
  }

  const stripe = await stripePromise;

  if (!stripe) {
    console.error('[getStripe] Stripe instance is null after load');
  } else {
    console.log('[getStripe] Stripe instance created successfully');
  }

  return stripe;
};

export default getStripe;