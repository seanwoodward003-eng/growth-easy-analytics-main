'use client'; // ← THIS MAKES IT A CLIENT COMPONENT (CRITICAL!)

import { useState } from 'react';
import Link from "next/link";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const email = e.target.email.value.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://growth-easy-analytics-2.onrender.com/api/signup', {
        method: 'POST',
        credentials: 'include', // ← Required so backend can set login cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          consent: true,
          // Add recaptchaToken later if you implement reCAPTCHA
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed — please try again');
      }

      // Success! Backend returns { success: true, redirect: "/dashboard" }
      setSuccess(true);

      if (data.redirect) {
        // Redirect to your dashboard
        window.location.href = data.redirect;
      } else {
        // Fallback redirect
        window.location.href = '/dashboard';
      }

    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-7xl md:text-8xl font-bold text-[#00ffff] text-center mb-16 animate-glitch">
          SIGN UP
        </h1>

        <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-12">
          <p className="text-2xl text-cyan-300 text-center mb-10">
            7-Day Free Trial • No Card Needed
          </p>

          {error && (
            <p className="text-red-400 text-center mb-6 font-bold bg-red-900/30 py-3 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-center mb-6 font-bold bg-green-900/30 py-3 rounded-lg">
              Account created! Redirecting to dashboard...
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Choose password"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
              required
              minLength={6}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ffff] text-black py-6 rounded-full text-3xl font-bold hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-cyan-400 mt-10 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00ffff] underline hover:no-underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}