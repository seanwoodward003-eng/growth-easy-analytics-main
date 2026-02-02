// lib/getStripe.ts
'use client'; // Ensure this runs only on client (add if missing)

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.group('[Stripe Debug] getStripe called');

  // Log environment at load time
  console.log('[Stripe Debug] Environment:', process.env.NODE_ENV);
  console.log('[Stripe Debug] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists?', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.log('[Stripe Debug] Key prefix:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.slice(0, 7) + '...'); // pk_test or pk_live
    console.log('[Stripe Debug] Key length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length);
  } else {
    console.error('[Stripe Debug] CRITICAL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing or empty');
    console.groupEnd();
    return null;
  }

  if (!stripePromise) {
    console.log('[Stripe Debug] No cached promise → starting loadStripe()');
    console.time('[Stripe Debug] loadStripe duration');

    try {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      
      const stripe = await stripePromise;
      
      console.timeEnd('[Stripe Debug] loadStripe duration');
      console.log('[Stripe Debug] SUCCESS: Stripe loaded');
      console.log('[Stripe Debug] Stripe version:', stripe?.version || 'unknown');
      console.log('[Stripe Debug] Stripe elements available?', !!stripe?.elements);
      console.log('[Stripe Debug] Stripe redirectToCheckout available?', !!stripe?.redirectToCheckout);
    } catch (err: any) {
      console.timeEnd('[Stripe Debug] loadStripe duration');
      console.error('[Stripe Debug] loadStripe FAILED');
      console.error('[Stripe Debug] Error name:', err.name);
      console.error('[Stripe Debug] Error message:', err.message);
      console.error('[Stripe Debug] Full error object:', err);
      console.error('[Stripe Debug] Stack trace:', err.stack || 'no stack');
      
      // Common specific checks
      if (err.message?.includes('Content-Security-Policy')) {
        console.error('[Stripe Debug] LIKELY CSP BLOCK: Stripe.js script refused by CSP');
      } else if (err.message?.includes('network')) {
        console.error('[Stripe Debug] NETWORK ISSUE: Failed to fetch Stripe.js');
      } else if (err.message?.includes('key')) {
        console.error('[Stripe Debug] KEY ISSUE: Invalid or revoked publishable key');
      }

      stripePromise = null; // Reset to allow retry
    }
  } else {
    console.log('[Stripe Debug] Returning cached Stripe promise');
  }

  console.groupEnd();
  return stripePromise;
};

export default getStripe;