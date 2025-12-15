'use client';

import { Sidebar } from "@/components/layout/Sidebar";
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
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-bg to-[#1a1f3d]">
      {/* Mobile Top Bar with Styled Menu Button */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyber-neon/40 shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-3xl font-bold text-cyber-neon glow-strong tracking-wider">
            GrowthEasy AI
          </h1>

          {/* Styled Menu Button with Text */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-cyber-neon/10 border-2 border-cyber-neon/50 hover:border-cyber-neon hover:bg-cyber-neon/20 transition-all duration-300 shadow-lg hover:shadow-cyber-neon/50"
          >
            {/* Icon */}
            <div className="relative">
              {mobileMenuOpen ? (
                <X size={32} className="text-cyber-neon group-hover:scale-110 transition-transform" />
              ) : (
                <Menu size={32} className="text-cyber-neon group-hover:scale-110 transition-transform" />
              )}
              {/* Pulse ring animation */}
              <span className="absolute inset-0 rounded-full bg-cyber-neon opacity-40 animate-ping"></span>
            </div>

            {/* MENU / CLOSE Text */}
            <span className="text-xl font-bold text-cyber-neon tracking-wide glow-medium uppercase">
              {mobileMenuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu Overlay - Enhanced Style */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav className="space-y-10" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group block text-6xl sm:text-7xl font-black text-cyan-300 hover:text-cyber-neon glow-strong transition-all duration-500 text-center relative"
              >
                {item.name}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-1 bg-cyber-neon/60 transition-all duration-500 rounded-full"></span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar + Main Content */}
      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile, fixed */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-20 lg:pt-0 lg:pl-64 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}