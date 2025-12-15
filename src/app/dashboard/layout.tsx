'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, X } from "lucide-react";  // ← Your existing lucide-react
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
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-bg to-[#1a1f3d]">
      {/* Mobile Top Bar with Hamburger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyber-neon/30">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-cyber-neon glow-medium">
            GrowthEasy AI
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 rounded-xl bg-cyber-neon/10 hover:bg-cyber-neon/30 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={32} className="text-cyber-neon" />
            ) : (
              <Menu size={32} className="text-cyber-neon" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          onClick={() => setMobileMenuOpen(false)} // Close when tapping backdrop
        >
          <nav className="space-y-8" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-5xl font-bold text-cyan-300 hover:text-cyber-neon glow-medium transition text-center"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar + Main Content */}
      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-20 lg:pt-0 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}