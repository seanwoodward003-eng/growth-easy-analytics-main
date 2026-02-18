'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.log('[getStripe DEBUG] Function called - timestamp:', new Date().toISOString());

  console.log('[getStripe DEBUG] Environment check - is client?', typeof window !== 'undefined');

  if (typeof window === 'undefined') {
    console.warn('[getStripe DEBUG] Called in server context - returning null immediately');
    return null;
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log('[getStripe DEBUG] Checking publishable key - exists?', !!key);

  if (key) {
    console.log('[getStripe DEBUG] Key length:', key.length);
    console.log('[getStripe DEBUG] Key prefix (first 7 chars):', key.slice(0, 7) + '...');
  } else {
    console.error('[getStripe DEBUG] CRITICAL: Publishable key is missing or undefined in client bundle');
    return null;
  }

  if (!stripePromise) {
    console.log('[getStripe DEBUG] No cached promise - initializing loadStripe now');
    console.time('[getStripe DEBUG] loadStripe total duration');

    stripePromise = loadStripe(key)
      .then((stripeInstance) => {
        console.timeEnd('[getStripe DEBUG] loadStripe total duration');
        console.log('[getStripe DEBUG] loadStripe promise RESOLVED successfully');
        console.log('[getStripe DEBUG] Stripe instance type:', stripeInstance ? typeof stripeInstance : 'null');
        if (stripeInstance) {
          console.log('[getStripe DEBUG] Stripe loaded - some object keys:', Object.keys(stripeInstance).slice(0, 5));
        }
        return stripeInstance;
      })
      .catch((err) => {
        console.timeEnd('[getStripe DEBUG] loadStripe total duration');
        console.error('[getStripe DEBUG] loadStripe promise REJECTED / failed');
        console.error('[getStripe DEBUG] Error message:', err?.message || err);
        console.error('[getStripe DEBUG] Error type:', err?.type || 'unknown');
        console.error('[getStripe DEBUG] Full error:', JSON.stringify(err, null, 2));
        return null;
      });
  } else {
    console.log('[getStripe DEBUG] Reusing cached promise from previous call');
  }

  console.log('[getStripe DEBUG] Awaiting the promise...');
  const stripe = await stripePromise;

  console.log('[getStripe DEBUG] Promise resolved - final Stripe result:', stripe ? 'valid instance' : 'null');
  if (!stripe) {
    console.error('[getStripe DEBUG] Stripe is null after await - load failed or rejected');
  } else {
    console.log('[getStripe DEBUG] Stripe ready for use');
  }

  return stripe;
};

export default getStripe;