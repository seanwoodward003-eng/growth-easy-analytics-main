'use client';

import { useState } from 'react';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  // Hardcode counters for now — replace with DB fetch later
  const earlySold = 147; // Example
  const totalLTDsSold = 387;

  const EARLY_CAP = 200;
  const TOTAL_CAP = 500;

  const earlyLeft = EARLY_CAP - earlySold;
  const totalLeft = TOTAL_CAP - totalLTDsSold;

  const showEarly = earlySold < EARLY_CAP;
  const showStandard = earlySold >= EARLY_CAP && totalLTDsSold < TOTAL_CAP;
  const lifetimeSoldOut = totalLTDsSold >= TOTAL_CAP;

  const handleCheckout = async (plan: 'early_ltd' | 'standard_ltd' | 'monthly' | 'annual') => {
    setLoading(plan);
    try {
      const priceMap = {
        early_ltd: process.env.NEXT_PUBLIC_STRIPE_PRICE_EARLY_LTD,
        standard_ltd: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_LTD,
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
        annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
      };

      const priceId = priceMap[plan];
      if (!priceId) throw new Error('Invalid plan');

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const stripe = await (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err: any) {
      alert('Checkout failed: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-20 text-center">
      <h1 className="glow-title text-6xl md:text-8xl font-black mb-20">Choose Your Plan</h1>

      <div className="max-w-5xl mx-auto space-y-20">
        {/* Early Bird */}
        {showEarly && (
          <div className="metric-bubble p-12">
            <h2 className="text-5xl font-bold mb-6">Early Bird Lifetime</h2>
            <p className="text-8xl font-black text-cyan-400 glow-number mb-6">£29.99</p>
            <p className="text-4xl text-red-400 mb-10 animate-pulse">Only {earlyLeft} left!</p>
            <button onClick={() => handleCheckout('early_ltd')} disabled={loading === 'early_ltd'} className="cyber-btn text-3xl px-12 py-6">
              {loading === 'early_ltd' ? 'Loading...' : 'Buy Early Bird Lifetime'}
            </button>
          </div>
        )}

        {/* Standard Lifetime */}
        {showStandard && (
          <div className="metric-bubble p-12">
            <h2 className="text-5xl font-bold mb-6">Lifetime Access</h2>
            <p className="text-8xl font-black text-cyan-400 glow-number mb-6">£47.99</p>
            <p className="text-4xl text-red-400 mb-10">Only {totalLeft} lifetime spots left forever</p>
            <button onClick={() => handleCheckout('standard_ltd')} disabled={loading === 'standard_ltd'} className="cyber-btn text-3xl px-12 py-6">
              {loading === 'standard_ltd' ? 'Loading...' : 'Buy Lifetime £47.99'}
            </button>
          </div>
        )}

        {/* Sold Out Message */}
        {lifetimeSoldOut && (
          <div className="metric-bubble p-12">
            <h2 className="text-5xl font-bold mb-6 text-gray-400">Lifetime Sold Out Forever</h2>
            <p className="text-3xl text-gray-500">Join thousands who secured lifetime access</p>
          </div>
        )}

        {/* Monthly */}
        <div className="metric-bubble p-12">
          <h2 className="text-5xl font-bold mb-6">Monthly</h2>
          <p className="text-8xl font-black text-cyan-400 glow-number mb-6">£37.99/mo</p>
          <button onClick={() => handleCheckout('monthly')} disabled={loading === 'monthly'} className="cyber-btn text-3xl px-12 py-6">
            {loading === 'monthly' ? 'Loading...' : 'Start Monthly'}
          </button>
        </div>

        {/* Annual */}
        <div className="metric-bubble p-12">
          <h2 className="text-5xl font-bold mb-6">Annual <span className="text-green-400">(Save 25%)</span></h2>
          <p className="text-8xl font-black text-cyan-400 glow-number mb-6">£347/year</p>
          <button onClick={() => handleCheckout('annual')} disabled={loading === 'annual'} className="cyber-btn text-3xl px-12 py-6">
            {loading === 'annual' ? 'Loading...' : 'Start Annual'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-32 px-6 text-gray-400">
        <p>Lifetime = current version + bug fixes forever + 12 months free major updates after close.</p>
        <p className="mt-4">7-day money-back guarantee on all plans.</p>
      </div>
    </div>
  );
}