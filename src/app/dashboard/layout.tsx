'use client';

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Acquisition", href: "/dashboard/acquisition" },
    { name: "Churn", href: "/dashboard/churn" },
    { name: "Retention", href: "/dashboard/retention" },
    { name: "Revenue", href: "/dashboard/revenue" },
    { name: "Performance", href: "/dashboard/performance" },
    { name: "AI Insights", href: "/dashboard/ai-insights" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f2c 0%, #1a1f3d 100%)' }}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,255,255,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
          <h1 className="glow-medium" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00ffff' }}>
            GrowthEasy AI
          </h1>

          {/* Styled Mobile Menu Button - using your existing styles */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X size={32} style={{ color: '#00ffff' }} />
            ) : (
              <Menu size={32} style={{ color: '#00ffff' }} />
            )}
            <span className="glow-soft">
              {mobileMenuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '3rem' }} onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="glow-strong"
                style={{ fontSize: '4.5rem', fontWeight: '900', color: '#00ffff', textAlign: 'center', position: 'relative' }}
              >
                {item.name}
                {item.name === "AI Insights" && (
                  <span style={{
                    position: 'absolute',
                    top: '-2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(to right, #ff00ff, #aa00ff)',
                    color: 'black',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '999px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite'
                  }}>
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content - full width */}
      <main style={{ paddingTop: '6rem', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}