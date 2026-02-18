'use client';

const getStripe = async () => {
  if (typeof window === 'undefined') {
    console.warn('[getStripe] Server-side call - returning null');
    return null;
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('[getStripe] No publishable key');
    return null;
  }

  console.log('[getStripe] Key length:', key.length);

  if (window.Stripe) {
    console.log('[getStripe] window.Stripe already exists');
    return window.Stripe(key);
  }

  console.log('[getStripe] Injecting Stripe.js script manually');

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      console.log('[getStripe] Stripe.js script loaded successfully');
      const stripe = window.Stripe(key);
      if (stripe) {
        console.log('[getStripe] Stripe instance created');
        resolve(stripe);
      } else {
        console.error('[getStripe] window.Stripe not available after script load');
        resolve(null);
      }
    };
    script.onerror = (err) => {
      console.error('[getStripe] Script load failed', err);
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

export default getStripe;