'use client';

import { useState, useEffect } from 'react';

const LTD_EARLY_BIRD_LIMIT = 400;
const LTD_TOTAL_LIMIT = 1000;

export default function Pricing() {
  const [earlyBirdSold, setEarlyBirdSold] = useState(0); // fetch from backend later
  const [totalLTDsSold, setTotalLTDsSold] = useState(0);

  // In real app, fetch from your back-end API
  useEffect(() => {
    // Example mock fetch — replace with real /api/pricing/counters
    setEarlyBirdSold(312); // demo
    setTotalLTDsSold(712);
  }, []);

  const earlyBirdLeft = LTD_EARLY_BIRD_LIMIT - earlyBirdSold;
  const totalLeft = LTD_TOTAL_LIMIT - totalLTDsSold;
  const showEarlyBird = earlyBirdSold < LTD_EARLY_BIRD_LIMIT;
  const showLTD = totalLTDsSold < LTD_TOTAL_LIMIT;

  return (
    <div className="min-h-screen px-6 py-20 text-center">
      <h1 className="glow-title text-6xl md:text-8xl font-black mb-16">
        Upgrade Plan
      </h1>

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Early Bird Lifetime */}
        {showEarlyBird && (
          <div className="metric-bubble">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              Early Bird Lifetime Deal
            </h2>
            <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-6">
              £67
            </p>
            <p className="text-3xl text-red-400 mb-8">
              Only {earlyBirdLeft} left!
            </p>
            <button className="cyber-btn text-3xl px-12 py-6">
              Buy Lifetime £67 (One-time)
            </button>
          </div>
        )}

        {/* Regular Lifetime */}
        {showLTD && !showEarlyBird && (
          <div className="metric-bubble">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              Lifetime Deal
            </h2>
            <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number mb-6">
              £97
            </p>
            <p className="text-3xl text-red-400 mb-8">
              Only {totalLeft} lifetime deals left ever
            </p>
            <button className="cyber-btn text-3xl px-12 py-6">
              Buy Lifetime £97 (One-time)
            </button>
          </div>
        )}

        {/* Monthly */}
        <div className="metric-bubble">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Monthly</h2>
          <p className="text-4xl line-through text-gray-500 mb-2">£37/month</p>
          <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number">
            £1 <span className="text-4xl">first 7 days</span>
          </p>
          <p className="text-3xl mt-6 mb-8">Then £37/month</p>
          <button className="cyber-btn text-3xl px-12 py-6">
            Start £1 Trial
          </button>
        </div>

        {/* Annual */}
        <div className="metric-bubble">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Annual <span className="text-green-400 text-4xl">(Save 33%)</span></h2>
          <p className="text-4xl line-through text-gray-500 mb-2">£444/year</p>
          <p className="text-7xl md:text-8xl font-black text-cyan-400 glow-number">
            £1 <span className="text-4xl">first 7 days</span>
          </p>
          <p className="text-3xl mt-6 mb-8">Then £297/year</p>
          <button className="cyber-btn text-3xl px-12 py-6">
            Start £1 Trial
          </button>
        </div>
      </div>

      {/* Small print */}
      <p className="text-xl md:text-2xl text-gray-400 mt-20 max-w-4xl mx-auto leading-relaxed">
        Lifetime = current version forever + bug fixes. After we close lifetime deals, you get 12 months of all future features free. After that, upgrade or stay on your version forever.<br /><br />
        Try Monthly or Annual for 7 days at £1 – full access, then auto-billed your selected plan. (card required)
      </p>
    </div>
  );
}