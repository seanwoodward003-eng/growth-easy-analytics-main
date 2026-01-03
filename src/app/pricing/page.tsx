'use client';

import { useState } from 'react';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  // TODO: Replace with real DB fetch in production
  const earlyBirdSold = 0;
  const totalLifetimeSold = 0;

  const EARLY_CAP = 200;
  const TOTAL_CAP = 500;

  const earlyLeft = EARLY_CAP - earlyBirdSold;
  const totalLeft = TOTAL_CAP - totalLifetimeSold;

  const showEarly = earlyBirdSold < EARLY_CAP;
  const showStandard = totalLifetimeSold < TOTAL_CAP;
  const lifetimeSoldOut = totalLifetimeSold >= TOTAL_CAP;

  const handleCheckout = async (plan: 'early_ltd' | 'standard_ltd' | 'monthly' | 'annual') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }), // Only send the plan name — secure
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      const stripe = await (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err: any) {
      alert('Checkout failed: ' + (err.message || 'Please try again'));
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-20 text-center bg-gradient-to-b from-black to-[#0a0f2c]">
      <h1 className="glow-title text-6xl md:text-8xl font-black mb-8">Choose Your Plan</h1>
      <p className="text-2xl text-cyan-300 mb-16">Lock in lifetime access before it's gone forever</p>

      {/* Urgency Counters */}
      <div className="max-w-4xl mx-auto mb-20 space-y-6">
        {showEarly && (
          <p className="text-5xl font-black text-red-400 animate-pulse">
            Only {earlyLeft} Early Bird spots left at £49!
          </p>
        )}
        <p className="text-4xl font-bold text-purple-400">
          Lifetime closes forever at {TOTAL_CAP} — {totalLeft} spots remaining
        </p>
        {lifetimeSoldOut && (
          <p className="text-4xl font-bold text-gray-500">Lifetime Sold Out Forever</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Early Bird */}
        {showEarly && (
          <div className="metric-bubble p-12 border-4 border-cyan-400/80 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">Early Bird Lifetime</h2>
            <p className="text-8xl font-black text-cyan-400 glow-number mb-8">£49</p>
            <p className="text-2xl text-red-400 mb-10">One-time • {earlyLeft} left</p>
            <button
              onClick={() => handleCheckout('early_ltd')}
              disabled={loading === 'early_ltd'}
              className="cyber-btn text-3xl px-12 py-6 w-full"
            >
              {loading === 'early_ltd' ? 'Loading...' : 'Grab Early Bird'}
            </button>
          </div>
        )}

        {/* Standard Lifetime */}
        {showStandard && (
          <div className="metric-bubble p-12 border-4 border-purple-500/80 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">Lifetime Access</h2>
            <p className="text-8xl font-black text-cyan-400 glow-number mb-8">£79</p>
            <p className="text-2xl text-purple-400 mb-10">One-time • Closes at 500</p>
            <button
              onClick={() => handleCheckout('standard_ltd')}
              disabled={loading === 'standard_ltd'}
              className="cyber-btn text-3xl px-12 py-6 w-full"
            >
              {loading === 'standard_ltd' ? 'Loading...' : 'Secure Lifetime'}
            </button>
          </div>
        )}

        {/* Monthly */}
        <div className="metric-bubble p-12">
          <h2 className="text-4xl font-bold mb-6">Monthly</h2>
          <p className="text-8xl font-black text-cyan-400 glow-number mb-8">£49<span className="text-4xl">/mo</span></p>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading === 'monthly'}
            className="cyber-btn text-3xl px-12 py-6 w-full"
          >
            {loading === 'monthly' ? 'Loading...' : 'Start Monthly'}
          </button>
        </div>

        {/* Annual – Best Value */}
        <div className="metric-bubble p-12 border-4 border-green-500/80 shadow-2xl scale-105">
          <div className="bg-green-500/20 text-green-400 text-xl font-bold px-6 py-3 rounded-full mb-6 inline-block">
            BEST VALUE — SAVE 16%
          </div>
          <h2 className="text-4xl font-bold mb-6">Annual</h2>
          <p className="text-8xl font-black text-cyan-400 glow-number mb-8">£490<span className="text-4xl">/year</span></p>
          <p className="text-2xl text-green-400 mb-10">= £41/mo</p>
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loading === 'annual'}
            className="cyber-btn bg-green-500 hover:bg-green-400 text-black text-3xl px-12 py-6 w-full"
          >
            {loading === 'annual' ? 'Loading...' : 'Go Annual & Save'}
          </button>
        </div>
      </div>

      {/* Guarantee */}
      <div className="max-w-4xl mx-auto mt-32 text-gray-300 text-xl space-y-6">
        <p className="text-3xl font-bold text-cyan-400">7-day money-back guarantee — no questions asked</p>
        <p>Lifetime plans include: current version + bug fixes forever + 12 months of all future major features free after close.</p>
        <p className="text-2xl text-purple-400 font-bold">Price increases automatically as we grow — lock in now.</p>
      </div>
    </div>
  );
}