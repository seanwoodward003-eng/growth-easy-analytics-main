// app/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';

// Disable prerender/cache/ISR completely
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ────────────────────────────────────────────────────────────────
    // Stronger embedded detection + redirect to dashboard
    // Shopify usually sends at least one of: embedded, shop, hmac, code, id_token
    // ────────────────────────────────────────────────────────────────
    const hasShopifyParam =
      params.has('embedded') ||
      params.has('hmac') ||
      params.has('shop') ||
      params.has('code') ||
      params.has('id_token');

    if (hasShopifyParam && window.location.pathname === '/') {
      console.log('[Embedded Fallback] Shopify params detected → redirecting to /dashboard');
      window.location.replace(`/dashboard${window.location.search}`);
      return; // prevent further execution
    }

    // ────────────────────────────────────────────────────────────────
    // Original error / message handling
    // ────────────────────────────────────────────────────────────────
    const error = params.get('error');

    if (error === 'trial_expired') {
      setMessage('Your 7-day free trial has ended — upgrade to continue');
    } else if (error === 'session_expired') {
      setMessage('Your session expired — please sign in again');
    } else if (error === 'login_required') {
      setMessage('Please sign in to continue');
    }

    // Client-side session check
    const checkSession = async () => {
      try {
        const res = await fetch('/api/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        // Silent fail
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/@.+\..+/.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    const endpoint = mode === 'signup' ? '/api/signup' : '/api/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          consent: true,
          marketing_consent: marketingConsent
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(mode === 'signup' 
          ? 'Check your email to verify and start your 7-day free trial!'
          : 'Welcome back! Redirecting to dashboard...'
        );
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setMessage(data.error || 'Something went wrong — please try again');
      }
    } catch {
      setMessage('Connection error — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-start pt-8 pb-32 px-4 text-center relative">
      {/* Trial Expired Banner */}
      {message.includes('Your 7-day free trial has ended') && (
        <div className="max-w-5xl mx-auto mb-16 p-10 bg-red-900/50 border-4 border-red-500 rounded-3xl shadow-2xl">
          <h2 className="text-6xl md:text-7xl font-black text-red-400 mb-6">
            Your 7-day free trial has ended
          </h2>
          <p className="text-3xl md:text-4xl text-cyan-300 mb-8">
            Upgrade now to keep full access to GrowthEasy AI forever
          </p>
          <Link href="/pricing">
            <button className="px-16 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-3xl font-black rounded-full hover:scale-105 transition shadow-2xl">
              View Plans & Upgrade
            </button>
          </Link>
        </div>
      )}

      {/* General Message Banner */}
      {message && !message.includes('Your 7-day free trial has ended') && (
        <div className={`max-w-2xl mx-auto mb-8 p-6 rounded-2xl text-center border-4 ${
          message.includes('Check') || message.includes('Welcome') || message.includes('Redirecting')
            ? 'bg-green-900/50 border-green-500 text-green-300'
            : 'bg-red-900/50 border-red-500 text-red-300'
        }`}>
          <p className="text-2xl font-bold">{message}</p>
        </div>
      )}

      {/* Hero */}
      <div className="max-w-6xl mx-auto z-10 w-full">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 md:mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent glow-title">
          GROWTHEASY AI
        </h1>
        <p className="text-3xl md:text-5xl font-bold text-cyan-300 mb-4 md:mb-8">
          AI-Powered Growth Intelligence for Your Store
        </p>
        <p className="text-xl md:text-2xl text-cyan-200 max-w-4xl mx-auto mb-8 md:mb-16">
          Connect your Shopify store and get real-time insights on revenue, churn, acquisition, retention — with an AI Growth Coach that reads your data and tells you exactly what to fix to make more money.
        </p>

        {/* CTA Form */}
        <div className="max-w-2xl mx-auto mb-12 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6 md:mb-8">
            {mode === 'signup' ? 'Start Your 7-Day Free Trial' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 w-full px-6 md:px-10 py-4 md:py-6 text-xl md:text-2xl bg-black/50 border-4 border-cyan-400 rounded-full text-white placeholder-cyan-500 focus:outline-none focus:border-cyan-300 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 md:px-16 py-4 md:py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-2xl font-black rounded-full hover:scale-105 transition shadow-2xl shadow-cyan-500/50 disabled:opacity-70"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Start Free Trial' : 'Sign In'}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="mt-6 text-left max-w-2xl mx-auto text-cyan-300 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="marketing_consent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="w-5 h-5 accent-cyan-400"
                />
                <span>
                  I agree to receive marketing emails from GrowthEasy AI (tips, updates, offers — unsubscribe anytime).
                  See our <Link href="/privacy" className="underline hover:text-cyan-100">Privacy Policy</Link>.
                </span>
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setMessage('');
              setEmail('');
              setMarketingConsent(false);
            }}
            className="mt-6 md:mt-8 text-cyan-300 hover:text-cyan-100 underline text-xl"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Sign up for free trial'}
          </button>
        </div>

        <div className="space-y-4 md:space-y-6 mb-12 md:mb-20">
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-red-400 animate-pulse">
            Only 200 Early Bird lifetime spots left at £49
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-400">
            Lifetime access closes forever at 500 — 500 spots remaining
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto mb-12 md:mb-20">
          <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 backdrop-blur-md">
            <h3 className="text-2xl md:text-3xl font-black text-cyan-300 mb-4 md:mb-6">Real-Time Analytics</h3>
            <p className="text-lg md:text-xl text-cyan-200">
              Revenue, churn, acquisition, retention — all updated live from your connected stores.
            </p>
          </div>
          <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 backdrop-blur-md">
            <h3 className="text-2xl md:text-3xl font-black text-purple-300 mb-4 md:mb-6">AI Growth Coach</h3>
            <p className="text-lg md:text-xl text-purple-200">
              Ask anything — Grok reads your actual data and gives specific, actionable advice to grow faster.
            </p>
          </div>
          <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-pink-900/20 to-cyan-900/20 border border-pink-500/30 backdrop-blur-md">
            <h3 className="text-2xl md:text-3xl font-black text-pink-300 mb-4 md:mb-6">Cyberpunk Design</h3>
            <p className="text-lg md:text-xl text-pink-200">
              Beautiful neon interface that makes checking your growth addictive.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-cyan-400 mb-8 md:mb-12">
            Lock In Lifetime Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-black border-4 border-cyan-400">
              <p className="text-5xl md:text-6xl font-black text-cyan-400 mb-4">£49</p>
              <p className="text-xl md:text-2xl text-red-400 mb-6 md:mb-8">Early Bird • 200 left</p>
              <p className="text-lg md:text-xl text-cyan-200">One-time payment</p>
            </div>
            <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-black border-4 border-purple-500">
              <p className="text-5xl md:text-6xl font-black text-purple-400 mb-4">£79</p>
              <p className="text-xl md:text-2xl text-purple-300 mb-6 md:mb-8">Lifetime • Closes at 500</p>
              <p className="text-lg md:text-xl text-purple-200">One-time payment</p>
            </div>
            <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-green-900/30 to-black border-4 border-green-500">
              <p className="text-5xl md:text-6xl font-black text-green-400 mb-4">£490/year</p>
              <p className="text-xl md:text-2xl text-green-300 mb-6 md:mb-8">Annual • Save 16%</p>
              <p className="text-lg md:text-xl text-green-200">= £41/mo</p>
            </div>
          </div>
          <p className="text-lg md:text-xl text-cyan-300 mt-8 md:mt-12">
            Instant activation — no waiting, no approval
          </p>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center text-cyan-500 text-sm space-x-4 md:space-x-8">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <p className="mt-4 text-cyan-400">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </footer>
    </main>
  );
}