'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async (): Promise<Stripe | null> => {
  console.groupCollapsed('[getStripe] AGGRESSIVE DEBUG START - ' + new Date().toISOString());

  // 1. Environment + UA (helps identify browser quirks)
  console.log('1. Environment:', {
    isClient: typeof window !== 'undefined',
    userAgent: navigator?.userAgent || 'no navigator',
    isSafari: /Safari/.test(navigator?.userAgent) && !/Chrome/.test(navigator?.userAgent),
    isChrome: /Chrome/.test(navigator?.userAgent),
    isPrivate: navigator?.userAgent?.includes('Safari') && !navigator?.userAgent?.includes('Version/'),
  });

  if (typeof window === 'undefined') {
    console.warn('Server-side → returning null');
    console.groupEnd();
    return null;
  }

  // 2. Key check
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  console.log('2. Key:', {
    exists: !!key,
    length: key?.length ?? 0,
    prefix: key?.slice(0, 7) ?? 'missing',
    validFormat: key?.startsWith('pk_') ?? false,
  });

  if (!key || !key.startsWith('pk_') || key.length < 80) {
    console.error('Invalid publishable key - aborting');
    console.groupEnd();
    return null;
  }

  // 3. Check if Stripe script is already in DOM (manual load or previous attempt)
  const existingScript = document.querySelector('script[src*="js.stripe.com/v3"]');
  console.log('3. Stripe script already in DOM?', {
    exists: !!existingScript,
    src: existingScript?.getAttribute('src') || 'none',
  });

  // 4. Cache check
  if (stripePromise) {
    console.log('4. Cache HIT - reusing');
  } else {
    console.log('4. Cache MISS - loading Stripe.js');

    console.time('loadStripe-total-time');

    stripePromise = loadStripe(key)
      .then((stripe) => {
        console.timeEnd('loadStripe-total-time');
        console.log('loadStripe → RESOLVED');

        // Aggressive: log EVERYTHING about what Stripe returned
        console.log('Stripe instance full inspection:', {
          exists: !!stripe,
          type: typeof stripe,
          isObject: stripe !== null && typeof stripe === 'object',
          hasRedirectToCheckout: !!stripe?.redirectToCheckout,
          hasElements: !!stripe?.elements,
          hasConfirmPayment: !!stripe?.confirmPayment,
          hasCreatePaymentMethod: !!stripe?.createPaymentMethod,
          hasKeys: stripe ? Object.keys(stripe).length : 0,
          first10Keys: stripe ? Object.keys(stripe).slice(0, 10) : [],
          isFunction: typeof stripe === 'function' ? 'unexpected callable' : 'not function',
        });

        if (!stripe || typeof stripe.redirectToCheckout !== 'function') {
          console.error('Stripe resolved but is BROKEN or INCOMPLETE');
          console.error('Likely cause: blocked fraud/telemetry scripts (m.stripe.com, hooks.stripe.com)');
        }

        return stripe || null;
      })
      .catch((err) => {
        console.timeEnd('loadStripe-total-time');
        console.error('loadStripe → REJECTED / crashed');
        console.error('Error details:', {
          name: err?.name,
          message: err?.message,
          type: err?.type,
          code: err?.code,
          stack: err?.stack,
          fullError: JSON.stringify(err, null, 2),
        });
        return null;
      });

    // Add timeout detection (Stripe load should never take >15s)
    stripePromise = Promise.race([
      stripePromise,
      new Promise<null>((_, reject) =>
        setTimeout(() => {
          console.error('loadStripe TIMEOUT after 15 seconds - script blocked or network issue');
          reject(new Error('loadStripe timeout'));
        }, 15000)
      ),
    ]).catch((err) => {
      console.error('Promise race failed:', err.message);
      return null;
    });
  }

  // 5. Await + final validation
  console.log('5. Awaiting resolution...');
  const stripe = await stripePromise;

  console.log('6. FINAL RESULT:', {
    stripeNull: stripe === null,
    stripeUndefined: stripe === undefined,
    canRedirect: stripe && typeof stripe.redirectToCheckout === 'function',
    canCreateElements: stripe && typeof stripe.elements === 'function',
  });

  if (!stripe || typeof stripe.redirectToCheckout !== 'function') {
    console.error('STRIPE FAILED TO INITIALIZE PROPERLY');
    console.error('Most likely causes (in order):');
    console.error('1. Ad blocker / privacy extension blocking m.stripe.com, hooks.stripe.com');
    console.error('2. Browser strict tracking prevention (ITP, Enhanced Safe Browsing)');
    console.error('3. Network / VPN / carrier filtering Stripe sub-domains');
    console.error('4. CSP violation (check Network tab for blocked requests)');
    console.error('5. Rare: script load race / timeout');
  } else {
    console.log('Stripe fully initialized - redirect should work');
  }

  console.groupEnd();
  return stripe;
};

export default getStripe;