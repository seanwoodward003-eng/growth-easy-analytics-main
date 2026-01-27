'use client';

import "./globals.css";
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SessionProvider } from 'next-auth/react'; // Added: required for useSession

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
        <SessionProvider> {/* Added: wraps all client components so useSession works */}
          {/* Header – logo image completely removed */}
          <header 
            className="
              fixed top-0 left-0 right-0 z-[100] 
              bg-[#0a0f2c]/95 backdrop-blur-lg 
              border-b-4 border-cyan-400/50 
              pt-[env(safe-area-inset-top,12px)] 
              px-4 pb-4 md:pb-4
            "
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-cyan-400 whitespace-nowrap">
                  GrowthEasy AI
                </h1>
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden z-[200] p-3 -mr-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition flex items-center justify-center shadow-xl"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="w-8 h-8 text-cyan-400" /> : <Menu className="w-8 h-8 text-cyan-400" />}
              </button>
            </div>
          </header>

          {/* Mobile Menu */}
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
                  <Link href="/dashboard/churn" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/churn') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Churn
                  </Link>
                  <Link href="/dashboard/revenue" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/revenue') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Revenue
                  </Link>
                  <Link href="/dashboard/acquisition" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/acquisition') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Acquisition
                  </Link>
                  <Link href="/dashboard/retention" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/retention') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Retention
                  </Link>
                  <Link href="/dashboard/performance" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/performance') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Performance
                  </Link>
                  <Link href="/dashboard/ai-growth-coach" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive('/dashboard/ai-growth-coach') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    AI Growth Coach
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${pathname === '/dashboard/settings' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Settings
                  </Link>
                  <Link href="/about" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${pathname === '/about' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    About
                  </Link>
                  <Link href="/privacy" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${pathname === '/privacy' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Privacy
                  </Link>
                  <Link href="/pricing" onClick={() => setMenuOpen(false)} className={`block text-2xl py-3 border-b border-cyan-600/50 ${pathname === '/pricing' ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                    Upgrade
                  </Link>
                  <button
                    onClick={() => {
                      document.cookie = 'access_token=; Max-Age=0; path=/';
                      document.cookie = 'refresh_token=; Max-Age=0; path=/';
                      document.cookie = 'csrf_token=; Max-Age=0; path=/';
                      window.location.href = '/';
                    }}
                    className="w-full text-left text-2xl text-red-400 py-3"
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
              pt-[calc(7rem + env(safe-area-inset-top,16px)))] 
              md:pt-[calc(8rem + env(safe-area-inset-top,20px)))] 
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
        </SessionProvider>
      </body>
    </html>
  );
}