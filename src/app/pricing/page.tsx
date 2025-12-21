'use client';

import { useState } from 'react';

const EARLY_BIRD_LIMIT = 400;
const TOTAL_LTD_LIMIT = 1000;

export default function Pricing() {
  const [earlyBirdSold] = useState(312); // replace with real fetch later
  const [totalLTDsSold] = useState(712);
  const [loading, setLoading] = useState<string | null>(null);

  const earlyBirdLeft = EARLY_BIRD_LIMIT - earlyBirdSold;
  const totalLeft = TOTAL_LTD_LIMIT - totalLTDsSold;

  const showEarlyBird = earlyBirdSold < EARLY_BIRD_LIMIT;
  const showLTD = totalLTDsSold < TOTAL_LTD_LIMIT;

  const handleCheckout = async (plan: 'lifetime_early' | 'lifetime' | 'monthly' | 'annual') => {
    setLoading(plan);

    try {
      const res = await fetch('https://growth-easy-analytics-2.onrender.com/api/create-checkout', {
        method: 'POST',
        credentials: 'include', // Critical: sends/receives cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await (window as any).Stripe('pk_live_51...'); // Use your live or test publishable key
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert('Error: No session ID returned');
      }
    } catch (err: any) {
      console.error(err);
      alert('Checkout failed: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-20 text-center">
      <h1 className="glow-title text-6xl md:text-8xl font-black mb-20">
        Upgrade Plan
      </h1>

      <div className="max-w-5xl mx-auto space-y-20">
        {/* Early Bird Lifetime */}
        {showEarlyBird && (
          <div className="metric-bubble">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Early Bird Lifetime</h2>
            <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-6">
              £67
            </p>
            <p className="text-3xl md:text-4xl text-red-400 mb-10">
              Only {earlyBirdLeft} left!
            </p>
            <button
              onClick={() => handleCheckout('lifetime_early')}
              disabled={loading === 'lifetime_early'}
              className="cyber-btn text-3xl px-12 py-6 disabled:opacity-70"
            >
              {loading === 'lifetime_early' ? 'Loading...' : 'Buy Lifetime £67 (One-time)'}
            </button>
          </div>
        )}

        {/* Regular Lifetime */}
        {!showEarlyBird && showLTD && (
          <div className="metric-bubble">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Lifetime Deal</h2>
            <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-6">
              £97
            </p>
            <p className="text-3xl md:text-4xl text-red-400 mb-10">
              Only {totalLeft} lifetime deals left ever
            </p>
            <button
              onClick={() => handleCheckout('lifetime')}
              disabled={loading === 'lifetime'}
              className="cyber-btn text-3xl px-12 py-6 disabled:opacity-70"
            >
              {loading === 'lifetime' ? 'Loading...' : 'Buy Lifetime £97 (One-time)'}
            </button>
          </div>
        )}

        {/* Monthly */}
        <div className="metric-bubble">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Monthly</h2>
          <p className="text-4xl line-through text-gray-500 mb-4">£37/month</p>
          <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-4">
            £1 <span className="text-4xl md:text-5xl">first 7 days</span>
          </p>
          <p className="text-3xl md:text-4xl mb-10">Then £37/month</p>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading === 'monthly'}
            className="cyber-btn text-3xl px-12 py-6 disabled:opacity-70"
          >
            {loading === 'monthly' ? 'Loading...' : 'Start £1 Trial'}
          </button>
        </div>

        {/* Annual */}
        <div className="metric-bubble">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Annual <span className="text-green-400 text-4xl md:text-5xl">(Save 33%)</span>
          </h2>
          <p className="text-4xl line-through text-gray-500 mb-4">£444/year</p>
          <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-4">
            £1 <span className="text-4xl md:text-5xl">first 7 days</span>
          </p>
          <p className="text-3xl md:text-4xl mb-10">Then £297/year</p>
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loading === 'annual'}
            className="cyber-btn text-3xl px-12 py-6 disabled:opacity-70"
          >
            {loading === 'annual' ? 'Loading...' : 'Start £1 Trial'}
          </button>
        </div>
      </div>

      {/* Small print */}
      <div className="max-w-4xl mx-auto mt-32 px-6">
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
          Lifetime = current version forever + bug fixes. After we close lifetime deals, you get 12 months of all future features free. After that, upgrade or stay on your version forever.
        </p>
        <p className="text-lg md:text-xl text-gray-400 mt-8 leading-relaxed">
          Try Monthly or Annual for 7 days at £1 – full access, then auto-billed your selected plan. (card required)
        </p>
      </div>
    </div>
  );
}