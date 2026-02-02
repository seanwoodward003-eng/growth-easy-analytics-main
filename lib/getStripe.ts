// lib/getStripe.ts
'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

console.log('[Stripe Debug] lib/getStripe module imported and loaded');

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.groupCollapsed('[Stripe Debug] getStripe() invoked');

  console.log('[Stripe Debug] Environment:', process.env.NODE_ENV);
  console.log('[Stripe Debug] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists?', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.log('[Stripe Debug] Key prefix:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.slice(0, 7) + '...');
    console.log('[Stripe Debug] Key length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length);
  } else {
    console.error('[Stripe Debug] CRITICAL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY MISSING OR EMPTY');
    console.groupEnd();
    return null;
  }

  if (!stripePromise) {
    console.log('[Stripe Debug] No cached promise - starting loadStripe()');
    console.time('[Stripe Debug] loadStripe execution time');

    try {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      const stripe = await stripePromise;

      console.timeEnd('[Stripe Debug] loadStripe execution time');
      console.log('[Stripe Debug] SUCCESS: Stripe.js fully loaded');
      console.log('[Stripe Debug] Stripe object keys:', Object.keys(stripe || {}));
    } catch (err: any) {
      console.timeEnd('[Stripe Debug] loadStripe execution time');
      console.error('[Stripe Debug] loadStripe REJECTED - Stripe failed to load');
      console.error('[Stripe Debug] Error name:', err.name || 'unknown');
      console.error('[Stripe Debug] Error message:', err.message || 'no message');
      console.error('[Stripe Debug] Full error:', JSON.stringify(err, null, 2));
      console.error('[Stripe Debug] Stack trace:', err.stack || 'no stack');

      if (err.message?.includes('CSP') || err.message?.includes('Content-Security-Policy')) {
        console.error('[Stripe Debug] CSP BLOCK: Browser refused to load https://js.stripe.com/v3/');
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('timeout')) {
        console.error('[Stripe Debug] NETWORK FAILURE: Could not reach Stripe CDN');
      } else if (err.message?.includes('key') || err.message?.includes('publishable') || err.message?.includes('invalid')) {
        console.error('[Stripe Debug] INVALID KEY: Check Stripe dashboard for key status');
      }

      stripePromise = null;
    }
  } else {
    console.log('[Stripe Debug] Returning cached Stripe promise');
  }

  console.groupEnd();
  return stripePromise;
};

export default getStripe;