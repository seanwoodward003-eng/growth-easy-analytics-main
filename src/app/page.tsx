// app/page.tsx
'use client';

import { useState } from 'react';

export default function LandingPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          ...(mode === 'signup' && { consent: true }),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Success! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setMessage(data.error || `${mode === 'signup' ? 'Signup' : 'Login'} failed — please try again`);
      }
    } catch (err) {
      setMessage('Connection error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl md:text-9xl font-black text-[#00ffff] mb-8 animate-glitch">
        GROWTHEASY AI
      </h1>

      <p className="text-2xl md:text-4xl text-cyan-300 mb-4">
        AI-Powered Growth Analytics
      </p>
      <p className="text-xl md:text-2xl text-cyan-400 mb-12 max-w-3xl">
        Optimize churn, acquisition, retention, revenue, and performance for your Shopify store — with real-time AI insights and cyberpunk style.
      </p>

      <div className="max-w-lg w-full bg-black/40 backdrop-blur-xl border-4 border-cyan-400 rounded-3xl p-10 shadow-2xl shadow-cyan-400/50">
        <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-8">
          {mode === 'signin' ? 'Welcome Back' : 'Start Your Free Trial'}
        </h2>

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
            className="w-full bg-[#00ffff] text-black px-12 py-6 rounded-xl text-2xl font-bold hover:scale-105 transition shadow-2xl shadow-[#00ffff]/50 disabled:opacity-70"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Start Free Trial'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-xl font-medium ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setMessage('');
            }}
            className="text-cyan-300 hover:text-cyan-100 underline text-lg"
          >
            {mode === 'signin' ? "New here? Sign up for free trial" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      <p className="absolute bottom-8 text-cyan-500 text-sm">
        Beta v0.1 © 2025 GrowthEasy AI
      </p>

<div className="mt-20 text-center text-cyan-500 text-sm space-x-8 pb-8">
  <a href="/privacy" className="hover:underline">Privacy Policy</a>
  <a href="/terms" className="hover:underline">Terms of Service</a>
</div>



    </main>
  );
}