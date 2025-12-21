// src/app/page.tsx — Public Landing Page with Working Signup Form
'use client';

import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        credentials: 'include', // Required for Flask to set cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          consent: true, // Required by your backend
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Success! Account created – redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard'; // Change if your dashboard route is different
        }, 1500);
      } else {
        setMessage(data.error || 'Signup failed — please try again');
      }
    } catch (err) {
      setMessage('Connection error — try refreshing the page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-7xl md:text-9xl font-bold text-[#00ffff] mb-8 animate-glitch">
        GROWTHEASY AI
      </h1>

      <p className="text-2xl md:text-4xl text-cyan-300 mb-4">
        AI-Powered Growth Analytics
      </p>
      <p className="text-xl md:text-2xl text-cyan-400 mb-16 max-w-3xl">
        Optimize churn, acquisition, retention, revenue, and performance for your Shopify store — with real-time AI insights and cyberpunk style.
      </p>

      {/* Signup Form + Log In Button */}
      <div className="space-y-8 max-w-lg w-full">
        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-8 py-5 text-lg bg-black/50 border-2 border-[#00ffff] text-[#00ffff] rounded-xl placeholder-cyan-600 focus:outline-none focus:ring-4 focus:ring-[#00ffff]/50 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ffff] text-black px-12 py-6 rounded-xl text-2xl font-bold hover:scale-110 transition shadow-2xl shadow-[#00ffff]/50 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? 'Creating Account...' : 'Start Free Trial'}
          </button>
        </form>

        {/* Success / Error Message */}
        {message && (
          <p
            className={`text-xl font-medium ${
              message.includes('Success') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* Log In Link */}
        <a
          href="/login"
          className="block border-2 border-[#00ffff] text-[#00ffff] px-12 py-6 rounded-xl text-2xl font-bold hover:bg-[#00ffff] hover:text-black transition inline-block"
        >
          Log In
        </a>
      </div>

      <p className="absolute bottom-8 text-cyan-500 text-sm">
        Beta v0.1 © 2025 GrowthEasy AI
      </p>
    </main>
  );
}