'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  if (typeof window === 'undefined') {
    console.warn('[getStripe] Called on server - returning null');
    return null;
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error('[getStripe] Publishable key missing');
    return null;
  }

  if (!stripePromise) {
    console.log('[getStripe] Loading Stripe with key length:', key.length);
    stripePromise = loadStripe(key).catch(err => {
      console.error('[getStripe] loadStripe error:', err?.message || err);
      return null;
    });
  }

  const stripe = await stripePromise;

  if (!stripe) {
    console.error('[getStripe] Stripe instance is null');
  } else {
    console.log('[getStripe] Stripe loaded OK');
  }

  return stripe;
};

export default getStripe;