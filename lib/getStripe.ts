'use client';

const getStripe = async () => {
  if (typeof window === 'undefined') {
    console.warn('[getStripe] Server-side - returning null');
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

  console.log('[getStripe] No Stripe instance - injecting script manually');

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;

    script.onload = () => {
      console.log('[getStripe] Stripe.js script onload fired');
      if (window.Stripe) {
        console.log('[getStripe] window.Stripe available - creating instance');
        const stripe = window.Stripe(key);
        resolve(stripe);
      } else {
        console.error('[getStripe] Script loaded but window.Stripe missing');
        resolve(null);
      }
    };

    script.onerror = (err) => {
      console.error('[getStripe] Script load ERROR:', err);
      resolve(null);
    };

    console.log('[getStripe] Appending script to <head>');
    document.head.appendChild(script);
  });
};

export default getStripe;