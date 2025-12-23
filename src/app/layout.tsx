'use client';

import "./globals.css";
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GrowthEasy AI</title>
      </head>
      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-screen`}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f2c]/95 backdrop-blur-lg border-b-4 border-cyan-400">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/dashboard" className="text-5xl md:text-7xl font-black text-cyan-400 glow-title">
              GrowthEasy AI
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-transparent border-4 border-cyan-400 text-cyan-400 px-8 py-4 rounded-full text-2xl font-medium hover:bg-cyan-400/20 transition"
            >
              Menu
            </button>
          </div>
        </header>

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
                <Link href="/dashboard/ai-insights" onClick={() => setMenuOpen(false)} className={`block text-3xl py-4 border-b border-cyan-600/50 ${isActive('/dashboard/ai-insights') ? 'text-cyan-400 font-bold' : 'text-cyan-300'}`}>
                  AI Insights
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

        <main className="pt-32 px-6 pb-40">
          {children}
        </main>
      </body>
    </html>
  );
}