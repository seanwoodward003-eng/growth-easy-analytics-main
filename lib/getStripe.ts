'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

console.log('[Stripe Debug] lib/getStripe module imported and loaded');

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.groupCollapsed('[Stripe Debug] getStripe() invoked');

  // ── Added detailed environment & device debug ──
  console.log('[Stripe Debug] window.location:', window.location.href);
  console.log('[Stripe Debug] User-Agent:', navigator.userAgent);
  console.log('[Stripe Debug] Is iOS device?', /iPhone|iPad|iPod/.test(navigator.userAgent));
  console.log('[Stripe Debug] Is Safari browser?', /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  console.log('[Stripe Debug] Screen width/height:', window.screen.width, 'x', window.screen.height);
  console.log('[Stripe Debug] Current time (start):', new Date().toISOString());

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
      // ── Very important log right before the call ──
      console.log('[Stripe Debug] Calling loadStripe with key length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length);

      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      console.log('[Stripe Debug] loadStripe() returned a promise');

      const stripe = await stripePromise;

      console.log('[Stripe Debug] loadStripe promise resolved');
      console.timeEnd('[Stripe Debug] loadStripe execution time');
      console.log('[Stripe Debug] SUCCESS: Stripe.js fully loaded');
      console.log('[Stripe Debug] Stripe object keys:', Object.keys(stripe || {}));
      console.log('[Stripe Debug] Stripe version (if available):', stripe?._api?.version || 'not exposed');
    } catch (err: any) {
      console.timeEnd('[Stripe Debug] loadStripe execution time');
      console.error('[Stripe Debug] loadStripe REJECTED / failed');
      console.error('[Stripe Debug] Error name:', err.name || 'unknown');
      console.error('[Stripe Debug] Error message:', err.message || 'no message');
      console.error('[Stripe Debug] Full error:', JSON.stringify(err, null, 2));
      console.error('[Stripe Debug] Stack trace:', err.stack || 'no stack');
      stripePromise = null;
    }
  } else {
    console.log('[Stripe Debug] Returning cached Stripe promise');
  }

  console.log('[Stripe Debug] getStripe completed - returning promise');
  console.groupEnd();
  return stripePromise;
};

export default getStripe;