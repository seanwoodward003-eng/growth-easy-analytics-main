'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Hardcoded for launch — replace with DB fetch later
  const earlyLeft = 200;
  const totalLeft = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/@.+\..+/.test(email)) {
      setMessage('Please enter a valid email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), consent: true }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Check your email to verify and start your 7-day free trial!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        setMessage(data.error || 'Something went wrong — try again');
      }
    } catch {
      setMessage('Connection error — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black text-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-glow">
            GROWTHEASY AI
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-cyan-300 mb-8">
            AI-Powered Growth Intelligence for Your Store
          </p>
          <p className="text-xl md:text-2xl text-cyan-200 max-w-4xl mx-auto mb-16">
            Connect your Shopify store and get real-time insights on revenue, churn, acquisition, retention — with an AI Growth Coach that reads your data and tells you exactly what to fix to make more money.
          </p>

          {/* CTA Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 w-full px-10 py-6 text-2xl bg-black/50 border-4 border-cyan-400 rounded-full text-white placeholder-cyan-500 focus:outline-none focus:border-cyan-300 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-16 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-2xl font-black rounded-full hover:scale-105 transition shadow-2xl shadow-cyan-500/50 disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Start Free Trial'}
              </button>
            </div>
            {message && (
              <p className={`mt-6 text-xl ${message.includes('Check your email') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>

          {/* Urgency */}
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-4xl font-black text-red-400 animate-pulse">
              Only {earlyLeft} Early Bird lifetime spots left at £49
            </p>
            <p className="text-3xl text-purple-400">
              Lifetime access closes forever at {TOTAL_CAP} — {totalLeft} spots remaining
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30">
            <h3 className="text-3xl font-black text-cyan-300 mb-6">Real-Time Analytics</h3>
            <p className="text-xl text-cyan-200">
              Revenue, churn, acquisition, retention — all updated live from your connected stores.
            </p>
          </div>
          <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
            <h3 className="text-3xl font-black text-purple-300 mb-6">AI Growth Coach</h3>
            <p className="text-xl text-purple-200">
              Ask anything — Grok reads your actual data and gives specific, actionable advice to grow faster.
            </p>
          </div>
          <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-pink-900/20 to-cyan-900/20 border border-pink-500/30">
            <h3 className="text-3xl font-black text-pink-300 mb-6">Cyberpunk Design</h3>
            <p className="text-xl text-pink-200">
              Beautiful neon interface that makes checking your growth addictive.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-black mb-12 text-cyan-400">
          Lock In Lifetime Access
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-black border-4 border-cyan-400">
            <p className="text-6xl font-black text-cyan-400 mb-4">£49</p>
            <p className="text-2xl text-red-400 mb-8">Early Bird • {earlyLeft} left</p>
            <p className="text-xl text-cyan-200">One-time payment</p>
          </div>
          <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-black border-4 border-purple-500">
            <p className="text-6xl font-black text-purple-400 mb-4">£79</p>
            <p className="text-2xl text-purple-300 mb-8">Lifetime • Closes at 500</p>
            <p className="text-xl text-purple-200">One-time payment</p>
          </div>
          <div className="p-10 rounded-3xl bg-gradient-to-br from-green-900/30 to-black border-4 border-green-500">
            <p className="text-6xl font-black text-green-400 mb-4">£490/year</p>
            <p className="text-2xl text-green-300 mb-8">Annual • Save 16%</p>
            <p className="text-xl text-green-200">= £41/mo</p>
          </div>
        </div>
        <p className="text-xl text-cyan-300 mt-12">
          7-day money-back guarantee on all plans
        </p>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-cyan-500 text-lg space-x-8 border-t border-cyan-900/50">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <p className="mt-6 text-cyan-400">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </footer>
    </main>
  );
}