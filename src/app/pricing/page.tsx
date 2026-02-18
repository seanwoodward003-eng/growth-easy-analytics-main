'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import getStripe from '@/lib/getStripe';

function TrialExpiredBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (error !== 'trial_expired') return null;

  return (
    <div className="max-w-5xl mx-auto mb-12 p-8 bg-red-900/40 border-4 border-red-500 rounded-3xl shadow-2xl">
      <h2 className="text-5xl md:text-6xl font-black text-red-400 mb-4">
        Your 7-day free trial has ended
      </h2>
      <p className="text-2xl md:text-3xl text-cyan-300">
        Upgrade now to unlock unlimited access to GrowthEasy AI forever
      </p>
    </div>
  );
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const earlyBirdSold = 0;
  const totalLifetimeSold = 0;
  const EARLY_CAP = 75;
  const TOTAL_CAP = 150;
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
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      if (!data.sessionId) {
        throw new Error('No sessionId returned from server');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) throw error;
    } catch (err: any) {
      alert('Checkout failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 md:px-8 lg:px-12 text-center bg-gradient-to-b from-black to-[#0a0f2c]">
      <Suspense fallback={null}>
        <TrialExpiredBanner />
      </Suspense>

      <h1 className="glow-title text-4xl md:text-5xl font-black mb-6">
        Choose Your Plan
      </h1>
      <p className="text-xl md:text-2xl text-cyan-300 mb-10">Lock in lifetime access before it's gone forever</p>

      <div className="max-w-4xl mx-auto mb-10 space-y-4">
        {showEarly && (
          <p className="text-3xl md:text-4xl font-black text-red-400 animate-pulse">
            Only {earlyLeft} Early Bird spots left at £49!
          </p>
        )}
        <p className="text-2xl md:text-3xl font-bold text-purple-400">
          Lifetime closes forever at {TOTAL_CAP} — {totalLeft} spots remaining
        </p>
        {lifetimeSoldOut && (
          <p className="text-2xl md:text-3xl font-bold text-gray-500">Lifetime Sold Out Forever</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {showEarly && (
          <div className="metric-card p-5 md:p-6 rounded-3xl text-center aspect-[4/7] flex flex-col justify-between border-4 border-cyan-400/80 shadow-2xl max-w-[340px] mx-auto overflow-hidden">
            <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Early Bird Lifetime</h2>
              <p className="text-5xl md:text-6xl font-black text-cyan-400 glow-number mb-2">£49</p>
              <p className="text-sm md:text-base text-red-400 mb-2">One-time • {earlyLeft} left</p>
            </div>
            <button
              onClick={() => handleCheckout('early_ltd')}
              disabled={loading === 'early_ltd'}
              className="cyber-btn text-lg md:text-xl px-6 py-3 mt-2 w-full"
            >
              {loading === 'early_ltd' ? 'Loading...' : 'Grab Early Bird'}
            </button>
          </div>
        )}

        {showStandard && (
          <div className="metric-card p-5 md:p-6 rounded-3xl text-center aspect-[4/7] flex flex-col justify-between border-4 border-purple-500/80 shadow-2xl max-w-[340px] mx-auto overflow-hidden">
            <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Lifetime Access</h2>
              <p className="text-5xl md:text-6xl font-black text-cyan-400 glow-number mb-2">£79</p>
              <p className="text-sm md:text-base text-purple-400 mb-2">One-time • Closes at 150</p>
            </div>
            <button
              onClick={() => handleCheckout('standard_ltd')}
              disabled={loading === 'standard_ltd'}
              className="cyber-btn text-lg md:text-xl px-6 py-3 mt-2 w-full"
            >
              {loading === 'standard_ltd' ? 'Loading...' : 'Secure Lifetime'}
            </button>
          </div>
        )}

        <div className="metric-card p-5 md:p-6 rounded-3xl text-center aspect-[4/7] flex flex-col justify-between max-w-[340px] mx-auto overflow-hidden">
          <div className="flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Monthly</h2>
            <p className="text-5xl md:text-6xl font-black text-cyan-400 glow-number mb-2">£49</p>
          </div>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading === 'monthly'}
            className="cyber-btn text-lg md:text-xl px-6 py-3 mt-2 w-full"
          >
            {loading === 'monthly' ? 'Loading...' : 'Start Monthly'}
          </button>
        </div>

        <div className="metric-card p-5 md:p-6 rounded-3xl text-center aspect-[4/7] flex flex-col justify-between border-4 border-green-500/80 shadow-2xl max-w-[340px] mx-auto overflow-hidden">
          <div className="flex flex-col items-center">
            <div className="bg-green-500/20 text-green-400 text-sm md:text-base font-bold px-3 py-1 rounded-full mb-2 inline-block">
              BEST VALUE — SAVE 16%
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Annual</h2>
            <p className="text-5xl md:text-6xl font-black text-cyan-400 glow-number mb-2">£490</p>
            <p className="text-sm md:text-base text-green-400 mb-2">= £41/mo</p>
          </div>
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loading === 'annual'}
            className="cyber-btn bg-green-500 hover:bg-green-400 text-black text-lg md:text-xl px-6 py-3 mt-2 w-full"
          >
            {loading === 'annual' ? 'Loading...' : 'Go Annual & Save'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 text-gray-300 text-lg md:text-xl space-y-4">
        <p className="text-2xl md:text-3xl font-bold text-cyan-400">7-day money-back guarantee — no questions asked</p>
        <p>Lifetime plans include core access + ongoing minor updates forever. Major new features available as optional paid upgrades.</p>
        <p className="text-xl md:text-2xl text-purple-400 font-bold">Price increases automatically as we grow — lock in now.</p>
      </div>
    </div>
  );
}