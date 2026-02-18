'use client';

import "./globals.css";
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const isCoachPage = pathname === '/dashboard/ai-growth-coach';
  const isActive = (path: string) => pathname.startsWith(path);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShowCookieBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowCookieBanner(false);
  };

  const handleLogout = async () => {
    console.log('[LAYOUT] Logout clicked - starting process');
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[LAYOUT] Logout fetch status:', response.status);

      if (!response.ok) {
        console.error('[LAYOUT] Logout request failed:', await response.text());
      }
    } catch (error) {
      console.error('[LAYOUT] Error during logout fetch:', error);
    }

    // Clear any client-side state if needed
    localStorage.removeItem('cookie_consent');

    // Safe redirect (replace instead of href to avoid adding to history)
    console.log('[LAYOUT] Redirecting to home after logout');
    window.location.replace('/');
  };

  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" 
        />
        <title>GrowthEasy AI</title>
      </head>

      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-dvh relative overflow-x-hidden`}>
        {/* Header */}
        <header 
          className="
            fixed top-0 left-0 right-0 z-[100] 
            bg-[#0a0f2c]/95 backdrop-blur-lg 
            border-b-4 border-cyan-400/50 
            pt-4 md:pt-4 lg:pt-4
            sm:pt-[env(safe-area-inset-top,12px)] sm:pb-5
            px-4 pb-4
          "
        >
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-cyan-400 whitespace-nowrap">
                GrowthEasy AI
              </h1>
            </Link>

            {/* Desktop Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hidden lg:flex z-[200] px-6 py-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition items-center justify-center shadow-xl text-cyan-400 font-bold text-lg"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              Menu
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden z-[200] p-3 -mr-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition flex items-center justify-center shadow-xl"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-8 h-8 text-cyan-400" /> : <Menu className="w-8 h-8 text-cyan-400" />}
            </button>
          </div>
        </header>

        {/* Side Menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150]" onClick={() => setMenuOpen(false)} />
            <nav 
              className="
                fixed inset-y-0 right-0 w-80 
                bg-[#0a0f2c]/98 backdrop-blur-xl z-[200] 
                border-l-4 border-cyan-400 
                pt-[calc(6rem + env(safe-area-inset-top,12px))] 
                px-6 overflow-y-auto
              "
            >
              <div className="space-y-5 pt-4">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  Dashboard
                </Link>
                {/* ... other links ... */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left text-2xl text-red-400 py-3 hover:text-red-300 transition"
                >
                  Logout
                </button>
              </div>
            </nav>
          </>
        )}

        {/* Main content */}
        <main 
          className={`
            pt-24 sm:pt-[calc(6rem + env(safe-area-inset-top,16px)))]
            md:pt-32 lg:pt-36
            ${isCoachPage ? '' : 'pb-20'}
          `}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Cookie Banner */}
        {showCookieBanner && (
          <div 
            className="
              fixed bottom-0 left-0 right-0 z-50 
              bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400 
              p-4 md:p-6 shadow-2xl 
              pb-[calc(1.5rem + env(safe-area-inset-bottom,0px))]
            "
          >
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-cyan-200 text-center md:text-left text-sm md:text-base">
                We use cookies to enhance your experience and for essential functions. By continuing, you agree to our{' '}
                <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">Privacy Policy</Link>{' '}
                and{' '}
                <Link href="/terms" className="text-cyan-400 underline hover:text-cyan-300">Terms of Service</Link>.
              </p>
              <div className="flex gap-4">
                <button onClick={acceptCookies} className="bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl hover:scale-105 transition">
                  Accept All
                </button>
                <button onClick={declineCookies} className="border-4 border-cyan-400 text-cyan-400 px-6 py-3 rounded-xl hover:bg-cyan-400/20 transition">
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isCoachPage && (
          <footer className="py-8 text-center text-cyan-500 text-sm border-t border-cyan-900/50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>{' '}
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <p className="mt-4 text-cyan-400">Beta v0.1 © 2025 GrowthEasy AI</p>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}