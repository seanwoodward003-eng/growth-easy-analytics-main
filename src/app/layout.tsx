// src/app/layout.tsx
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "GrowthEasy AI",
  description: "AI-powered growth analytics for e-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-screen`}>
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f2c]/95 backdrop-blur-xl border-b-4 border-cyan-400 shadow-2xl shadow-cyan-400/30">
          <div className="px-6 py-8 flex items-center justify-between">
            <h1 className="text-5xl md:text-7xl font-black text-cyan-400 glow-strong glitch">
              GrowthEasy AI
            </h1>
            <button id="menuBtn" className="px-10 py-5 border-4 border-cyan-400 rounded-full text-3xl font-bold text-cyan-400 glow-medium bg-transparent hover:bg-cyan-400 hover:text-black transition-all duration-300 hover:scale-105">
              Menu
            </button>
          </div>
        </header>

        {/* Mobile Slide-In Menu */}
        <div id="mobileMenu" className="fixed top-0 right-0 w-80 h-full bg-[#0a0f2c]/98 backdrop-blur-2xl z-50 transform translate-x-full transition-transform duration-500 ease-in-out border-l-4 border-cyan-400 pt-32 px-8 overflow-y-auto">
          <div className="space-y-6">
            <a href="/dashboard" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Dashboard</a>
            <a href="/dashboard/acquisition" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Acquisition</a>
            <a href="/dashboard/churn" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Churn</a>
            <a href="/dashboard/retention" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Retention</a>
            <a href="/dashboard/revenue" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Revenue</a>
            <a href="/dashboard/performance" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">Performance</a>
            <a href="/about" className="block text-4xl font-medium text-cyan-300 py-5 border-b-2 border-cyan-600/50 hover:text-cyan-100 transition">About</a>
            <button className="w-full text-left text-4xl font-medium text-red-400 py-5 hover:text-red-300 transition">Logout</button>
          </div>
        </div>

        {/* Overlay */}
        <div id="overlay" className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 hidden"></div>

        <main className="pt-32 px-6 pb-20">
          {children}
        </main>

        {/* Mobile Menu Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                const btn = document.getElementById('menuBtn');
                const menu = document.getElementById('mobileMenu');
                const overlay = document.getElementById('overlay');

                btn.onclick = () => {
                  menu.classList.toggle('translate-x-full');
                  overlay.classList.toggle('hidden');
                };

                overlay.onclick = () => {
                  menu.classList.add('translate-x-full');
                  overlay.classList.add('hidden');
                };
              });
            `,
          }}
        />
      </body>
    </html>
  );
}