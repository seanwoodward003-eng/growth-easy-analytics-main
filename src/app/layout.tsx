'use client';

import "./globals.css";
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

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
        {/* 
          IMPORTANT: Only ONE viewport meta – using viewport-fit=cover 
          helps with notch / dynamic island 
        */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover" 
        />

        {/* Prevent the ? icon in corner when added to home screen */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Optional: more sizes – iOS likes these */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="manifest" href="/manifest.json" />

        <title>GrowthEasy AI</title>
      </head>

      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-dvh relative overflow-x-hidden`}>
        {/* Header – fixed + safe-area aware padding */}
        <header 
          className="
            fixed top-0 left-0 right-0 z-[100] 
            bg-[#0a0f2c]/95 backdrop-blur-lg 
            border-b-4 border-cyan-400/50 
            pt-[env(safe-area-inset-top,0px)]   /* ← key fix for notch */
            px-4 pb-3 md:py-4
          "
        >
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <img 
                src="/logo.png"
                alt="GrowthEasy AI"
                className="h-10 md:h-12 w-auto object-contain logo crisp"
              />
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-cyan-400 glow-title whitespace-nowrap">
                GrowthEasy AI
              </h1>
            </Link>

            {/* Menu button – bump z-index even higher if needed */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden relative z-[200] p-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition flex items-center justify-center shadow-xl"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X className="w-8 h-8 text-cyan-400" />
              ) : (
                <Menu className="w-8 h-8 text-cyan-400" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu – also push down by safe-area */}
        {menuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150]" 
              onClick={() => setMenuOpen(false)} 
            />
            <nav 
              className="
                fixed top-0 right-0 w-80 h-full 
                bg-[#0a0f2c]/98 backdrop-blur-xl z-[200] 
                border-l-4 border-cyan-400 
                pt-[calc(5rem+env(safe-area-inset-top,0px))] 
                px-6 overflow-y-auto
              "
            >
              <div className="space-y-5">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={`block text-2xl md:text-3xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Dashboard
                </Link>
                {/* ... keep all other links the same ... */}
                <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className={`block text-2xl md:text-3xl py-3 border-b border-cyan-600/50 ${pathname === '/dashboard/settings' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Settings
                </Link>
                {/* ... other links ... */}
                <button
                  onClick={() => {
                    document.cookie = 'access_token=; Max-Age=0; path=/';
                    document.cookie = 'refresh_token=; Max-Age=0; path=/';
                    document.cookie = 'csrf_token=; Max-Age=0; path=/';
                    window.location.href = '/';
                  }}
                  className="w-full text-left text-2xl md:text-3xl text-red-400 py-3"
                >
                  Logout
                </button>
              </div>
            </nav>
          </>
        )}

        {/* MAIN CONTENT – pad top with header height + safe-area */}
        <main 
          className={`
            pt-[calc(5.5rem+env(safe-area-inset-top,1rem))] 
            sm:pt-[calc(7rem+env(safe-area-inset-top,1.5rem))] 
            ${isCoachPage ? '' : 'pb-20'}
          `}
        >
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        {/* Cookie Banner – also safe-area bottom if needed */}
        {showCookieBanner && (
          <div 
            className="
              fixed bottom-0 left-0 right-0 
              bg-[#0a0f2c]/95 backdrop-blur-lg 
              border-t-4 border-cyan-400 
              p-4 md:p-6 z-50 shadow-2xl 
              pb-[calc(1rem+env(safe-area-inset-bottom,0px))]
            "
          >
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-cyan-200 text-center md:text-left text-sm md:text-base">
                We use cookies to enhance your experience and for essential functions. By continuing, you agree to our{' '}
                <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-cyan-400 underline hover:text-cyan-300">
                  Terms of Service
                </Link>.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={acceptCookies}
                  className="bg-cyan-400 text-black font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl hover:scale-105 transition text-sm md:text-base"
                >
                  Accept All
                </button>
                <button
                  onClick={declineCookies}
                  className="border-4 border-cyan-400 text-cyan-400 px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-cyan-400/20 transition text-sm md:text-base"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isCoachPage && (
          <footer className="py-6 md:py-8 text-center text-cyan-500 text-sm space-x-6 md:space-x-8 border-t border-cyan-900/50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>{' '}
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <p className="mt-3 md:mt-4 text-cyan-400">
                Beta v0.1 © 2025 GrowthEasy AI
              </p>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}