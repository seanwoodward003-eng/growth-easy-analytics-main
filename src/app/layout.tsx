'use client';

import "./globals.css";
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const isCoachPage = pathname === '/dashboard/ai-growth-coach';

  const isActive = (path: string) => pathname.startsWith(path);

  // Cookie Consent
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowCookieBanner(false);
  };

  return (
    <html lang="en">
      <head>
        {/* Perfect mobile viewport – fixes address bar & keyboard issues */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>GrowthEasy AI</title>
      </head>
      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-dvh relative overflow-x-hidden`}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f2c]/95 backdrop-blur-lg border-b-4 border-cyan-400/50 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-5xl md:text-7xl font-black text-cyan-400 glow-title">
              GrowthEasy AI
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative group px-12 py-5 rounded-2xl overflow-hidden border-4 border-transparent transition-all duration-300 hover:border-cyan-400/70 shadow-2xl hover:shadow-cyan-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 bg-[#0a0f2c]/80 px-12 py-4 rounded-xl text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 glow-medium">
                Menu
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)} />
            <nav className="fixed top-0 right-0 w-80 h-full bg-[#0a0f2c]/98 backdrop-blur-xl z-50 border-l-4 border-cyan-400 pt-32 px-8 overflow-y-auto">
              <div className="space-y-6">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Dashboard
                </Link>
                <Link href="/dashboard/churn" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/churn') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Churn
                </Link>
                <Link href="/dashboard/revenue" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/revenue') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Revenue
                </Link>
                <Link href="/dashboard/acquisition" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/acquisition') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Acquisition
                </Link>
                <Link href="/dashboard/retention" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/retention') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Retention
                </Link>
                <Link href="/dashboard/performance" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/performance') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Performance
                </Link>
                <Link href="/dashboard/ai-growth-coach" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/ai-growth-coach') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  AI Growth Coach
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${pathname === '/about' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  About
                </Link>
                <Link href="/privacy" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${pathname === '/privacy' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Privacy
                </Link>
                <Link href="/pricing" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${pathname === '/pricing' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Upgrade
                </Link>
                <button
                  onClick={() => {
                    document.cookie = 'access_token=; Max-Age=0; path=/';
                    document.cookie = 'refresh_token=; Max-Age=0; path=/';
                    document.cookie = 'csrf_token=; Max-Age=0; path=/';
                    window.location.href = '/';
                  }}
                  className="w-full text-left text-3xl text-red-400 py-4"
                >
                  Logout
                </button>
              </div>
            </nav>
          </>
        )}

        {/* Main content – dynamic height, full screen on coach page */}
        <main className={isCoachPage ? 'min-h-dvh' : 'min-h-dvh pt-32 px-6 pb-40'}>
          {children}
        </main>

        {/* Cookie Banner */}
        {showCookieBanner && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400 p-6 z-50 shadow-2xl pb-safe">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-cyan-200 text-center md:text-left">
                We use cookies to enhance your experience and for essential functions. By continuing, you agree to our{' '}
                <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-cyan-400 underline hover:text-cyan-300">
                  Terms of Service
                </Link>
                .
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={acceptCookies}
                  className="bg-cyan-400 text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition"
                >
                  Accept All
                </button>
                <button
                  onClick={declineCookies}
                  className="border-4 border-cyan-400 text-cyan-400 px-8 py-4 rounded-xl hover:bg-cyan-400/20 transition"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer - hide on coach page */}
        {!isCoachPage && (
          <footer className="py-8 text-center text-cyan-500 text-sm space-x-8 border-t border-cyan-900/50">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <p className="mt-4 text-cyan-400">
              Beta v0.1 © 2025 GrowthEasy AI
            </p>
          </footer>
        )}
      </body>
    </html>
  );
}