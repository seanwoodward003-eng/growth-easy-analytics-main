'use client';

import './globals.css';
import { Orbitron } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export const metadata = {
  title: 'GrowthEasy AI',
  description: 'AI Growth Coach for SMBs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // To highlight active link

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/churn', label: 'Churn' },
    { href: '/acquisition', label: 'Acquisition' },
    { href: '/retention', label: 'Retention' },
    { href: '/revenue', label: 'Revenue' },
    { href: '/performance', label: 'Performance' },
    { href: '/about', label: 'About' },
    { href: '/signup', label: 'Sign Up' },
  ];

  return (
    <html lang="en">
      <body className={orbitron.className}>
        {/* Fixed Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b-4 border-cyber-neon shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-4xl md:text-5xl font-black text-cyber-neon glow-strong">
              GrowthEasy AI
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`nav-btn text-xl ${pathname === link.href ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <button className="cyber-btn text-xl px-8 py-3">Profile</button>
              <button className="cyber-btn text-xl px-8 py-3">Logout</button>
              <button className="cyber-btn text-xl px-8 py-3">Refresh</button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden cyber-btn text-2xl px-8 py-3"
            >
              Menu
            </button>
          </div>

          {/* Mobile Menu Overlay & Panel */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/95 backdrop-blur-lg z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-2xl border-l-4 border-cyber-neon z-50 p-8 pt-20 lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-6 right-6 text-5xl text-cyber-neon glow-medium"
                >
                  ×
                </button>

                <ul className="space-y-8">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block text-3xl nav-btn text-center py-4 ${pathname === link.href ? 'active' : ''}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <hr className="my-12 border-cyber-neon/50" />

                <div className="space-y-6">
                  <button className="w-full cyber-btn text-2xl py-5">Profile</button>
                  <button className="w-full cyber-btn text-2xl py-5">Logout</button>
                  <button className="w-full cyber-btn text-2xl py-5">Refresh</button>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Main Content - padded to avoid fixed nav overlap */}
        <main className="pt-32 lg:pt-36 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black/80 backdrop-blur-xl border-t-4 border-cyber-neon py-10">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-10 text-xl">
              <Link href="/about" className="nav-btn">About</Link>
              <Link href="/contact" className="nav-btn">Contact</Link>
              <Link href="/terms" className="nav-btn">Terms</Link>
              <Link href="/privacy" className="nav-btn">Privacy</Link>
            </div>
            <p className="text-cyan-300 text-lg glow-medium">
              Beta v1.1 © 2025 GrowthEasy AI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}