'use client';

import { useState } from 'react';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const stripe = await (window as any).Stripe('pk_live_...'); // your key
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err: any) {
      alert('Checkout failed: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-20 text-center">
      <h1 className="glow-title text-6xl md:text-8xl font-black mb-20">Upgrade Plan</h1>
      {/* Your pricing cards here — same as before, just call handleCheckout(plan) */}
    </div>
  );
}