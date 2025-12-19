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