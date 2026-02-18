'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Global declaration for window.Stripe (required for TS + manual fallback)
declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
  }
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.groupCollapsed('[getStripe] START - ' + new Date().toISOString());

  console.log('Step 1: Environment');
  console.log('  - typeof window:', typeof window);
  console.log('  - Is browser/client?', typeof window !== 'undefined');

  if (typeof window === 'undefined') {
    console.warn('  - Server-side execution detected - returning null early');
    console.groupEnd();
    return null;
  }

  console.log('Step 2: Publishable key check');
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log('  - Key exists in env?', !!key);
  if (key) {
    console.log('  - Key length:', key.length);
    console.log('  - Key starts with:', key.slice(0, 7) + '...');
  } else {
    console.error('  - CRITICAL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing or empty in client bundle');
    console.groupEnd();
    return null;
  }

  console.log('Step 3: Promise cache check');
  if (stripePromise) {
    console.log('  - Cache HIT - reusing existing promise');
  } else {
    console.log('  - Cache MISS - starting fresh loadStripe call');
    console.time('  - loadStripe duration');
    stripePromise = loadStripe(key)
      .then(stripe => {
        console.timeEnd('  - loadStripe duration');
        console.log('  - loadStripe RESOLVED');
        console.log('  - Stripe instance exists?', !!stripe);
        if (stripe) {
          console.log('  - Stripe object type:', typeof stripe);
          console.log('  - First 5 keys on Stripe object:', Object.keys(stripe).slice(0, 5));
        }
        return stripe;
      })
      .catch(err => {
        console.timeEnd('  - loadStripe duration');
        console.error('  - loadStripe REJECTED / failed');
        console.error('  - Error name:', err?.name || 'unknown');
        console.error('  - Error message:', err?.message || 'no message');
        console.error('  - Error type:', err?.type || 'unknown');
        console.error('  - Full error object:', JSON.stringify(err, null, 2));
        return null;
      });
  }

  console.log('Step 4: Awaiting promise resolution');
  const stripe = await stripePromise;

  console.log('Step 5: Final result');
  console.log('  - Stripe after await:', stripe ? 'valid instance' : 'null');
  if (!stripe) {
    console.error('  - Stripe is null - load failed, rejected, or timed out');
  } else {
    console.log('  - Stripe ready - ready to redirect');
  }

  console.groupEnd();
  return stripe;
};

export default getStripe;