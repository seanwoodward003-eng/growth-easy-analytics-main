'use client';

import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { NavigationMenu } from '@shopify/app-bridge-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function AppBridgeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [host, setHost] = useState<string | null>(null);

  const isCoachPage = pathname === '/dashboard/ai-growth-coach';
  const isActive = (path: string) => pathname.startsWith(path);

  useEffect(() => {
    // Extract host from URL params (required for App Bridge)
    const params = new URLSearchParams(window.location.search);
    const hostParam = params.get('host');
    if (hostParam) {
      setHost(hostParam);
    }

    // Cookie consent
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
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) console.error('Logout failed');
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.replace('/');
  };

  // Navigation items for App Bridge (injected into Shopify sidebar)
  const navigationItems = [
    { label: 'Dashboard', destination: '/dashboard' },
    { label: 'Churn', destination: '/dashboard/churn' },
    { label: 'Revenue', destination: '/dashboard/revenue' },
    { label: 'Acquisition', destination: '/dashboard/acquisition' },
    { label: 'Retention', destination: '/dashboard/retention' },
    { label: 'Performance', destination: '/dashboard/performance' },
    { label: 'AI Growth Coach', destination: '/dashboard/ai-growth-coach' },
    { label: 'Settings', destination: '/dashboard/settings' },
    { label: 'About', destination: '/about' },
    { label: 'Privacy', destination: '/privacy' },
    { label: 'Upgrade', destination: '/pricing' },
  ];

  if (!host) {
    return <div className="flex items-center justify-center h-screen text-cyan-300">Loading app...</div>;
  }

  return (
    <AppBridgeProvider config={{ apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '', host }}>
      {/* App Bridge injects navigation into Shopify sidebar */}
      <NavigationMenu
        navigationItems={navigationItems.map(item => ({
          label: item.label,
          destination: item.destination,
          match: pathname.startsWith(item.destination) ? 'exact' : 'none',
        }))}
      />

      {/* Your original header */}
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

          {/* Your desktop menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden lg:flex z-[200] px-6 py-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition items-center justify-center shadow-xl text-cyan-400 font-bold text-lg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            Menu
          </button>

          {/* Your mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden z-[200] p-3 -mr-3 rounded-full bg-gray-800/80 border border-cyan-500/60 hover:bg-gray-700/80 transition flex items-center justify-center shadow-xl"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-8 h-8 text-cyan-400" /> : <Menu className="w-8 h-8 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Your custom side menu drawer (kept as mobile fallback) */}
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
              {navigationItems.map(item => (
                <Link 
                  key={item.destination} 
                  href={item.destination} 
                  onClick={() => setMenuOpen(false)} 
                  className={`block text-2xl py-3 border-b border-cyan-600/50 ${isActive(item.destination) ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}
                >
                  {item.label}
                </Link>
              ))}
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

      {/* Your main content */}
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

      {/* Your cookie banner */}
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

      {/* Your footer */}
      {!isCoachPage && (
        <footer className="py-8 text-center text-cyan-500 text-sm border-t border-cyan-900/50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>{' '}
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <p className="mt-4 text-cyan-400">Beta v0.1 © 2025 GrowthEasy AI</p>
          </div>
        </footer>
      )}
    </AppBridgeProvider>
  );
}