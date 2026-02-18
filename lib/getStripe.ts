'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  if (typeof window === 'undefined') {
    console.warn('[getStripe] Called on server - returning null');
    return null;
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('[getStripe] Publishable key missing in client bundle');
    return null;
  }

  if (!stripePromise) {
    console.log('[getStripe] Initializing Stripe with key length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length);

    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).catch(err => {
      console.error('[getStripe] loadStripe failed:', err?.message || err);
      return null;
    });
  }

  const stripe = await stripePromise;
  if (!stripe) {
    console.error('[getStripe] Stripe loaded but returned null');
  } else {
    console.log('[getStripe] Stripe loaded successfully');
  }

  return stripe;
};

export default getStripe;