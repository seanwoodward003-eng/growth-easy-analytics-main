// lib/getStripe.ts
'use client'; // Ensures this runs only on the client (important for Stripe)

import { loadStripe, type Stripe } from '@stripe/stripe-js';

console.log('[Stripe Debug] lib/getStripe.ts module loaded');

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.group('[Stripe Debug] getStripe() called');

  // Log environment and key status
  console.log('[Stripe Debug] Current environment:', process.env.NODE_ENV);
  console.log('[Stripe Debug] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists?', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.log('[Stripe Debug] Key prefix:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.slice(0, 7) + '...');
    console.log('[Stripe Debug] Key full length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length);
  } else {
    console.error('[Stripe Debug] CRITICAL ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing or empty in environment variables');
    console.groupEnd();
    return null;
  }

  if (!stripePromise) {
    console.log('[Stripe Debug] No cached promise → initiating loadStripe()');
    console.time('[Stripe Debug] loadStripe duration');

    try {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      const stripe = await stripePromise;
      
      console.timeEnd('[Stripe Debug] loadStripe duration');
      console.log('[Stripe Debug] SUCCESS: Stripe.js loaded successfully');
      console.log('[Stripe Debug] Stripe elements method available?', !!stripe?.elements);
      console.log('[Stripe Debug] Stripe redirectToCheckout method available?', !!stripe?.redirectToCheckout);
    } catch (err: any) {
      console.timeEnd('[Stripe Debug] loadStripe duration');
      console.error('[Stripe Debug] loadStripe FAILED - Stripe.js did not load');
      console.error('[Stripe Debug] Error name:', err.name || 'unknown');
      console.error('[Stripe Debug] Error message:', err.message || 'no message');
      console.error('[Stripe Debug] Full error object:', JSON.stringify(err, null, 2));
      console.error('[Stripe Debug] Stack trace:', err.stack || 'no stack available');
      
      // Specific diagnosis helpers
      if (err.message?.includes('Content-Security-Policy') || err.message?.includes('CSP')) {
        console.error('[Stripe Debug] DIAGNOSIS: CSP violation - browser blocked https://js.stripe.com');
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('timeout')) {
        console.error('[Stripe Debug] DIAGNOSIS: Network failure - could not reach Stripe CDN');
      } else if (err.message?.includes('key') || err.message?.includes('publishable') || err.message?.includes('invalid')) {
        console.error('[Stripe Debug] DIAGNOSIS: Invalid or revoked publishable key');
      } else if (err.name === 'TypeError' && err.message?.includes('Promise')) {
        console.error('[Stripe Debug] DIAGNOSIS: Possible async race or promise rejection');
      }

      stripePromise = null; // Reset so next attempt retries
    }
  } else {
    console.log('[Stripe Debug] Returning previously cached stripePromise');
  }

  console.groupEnd();
  return stripePromise;
};

export default getStripe;