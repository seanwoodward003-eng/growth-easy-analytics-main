// src/app/page.tsx — Public Landing Page
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-7xl md:text-9xl font-bold text-[#00ffff] mb-8 animate-glitch">
        GROWTHEASY AI
      </h1>

      <p className="text-2xl md:text-4xl text-cyan-300 mb-4">
        AI-Powered Growth Analytics
      </p>
      <p className="text-xl md:text-2xl text-cyan-400 mb-16 max-w-3xl">
        Optimize churn, acquisition, retention, revenue, and performance for your Shopify store — with real-time AI insights and cyberpunk style.
      </p>

      <div className="space-x-8">
        <Link
          href="/login"
          className="bg-[#00ffff] text-black px-12 py-6 rounded-xl text-2xl font-bold hover:scale-110 transition shadow-2xl shadow-[#00ffff]/50"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="border-2 border-[#00ffff] text-[#00ffff] px-12 py-6 rounded-xl text-2xl font-bold hover:bg-[#00ffff] hover:text-black transition"
        >
          Start Free Trial
        </Link>
      </div>

      <p className="absolute bottom-8 text-cyan-500 text-sm">
        Beta v0.1 © 2025 GrowthEasy AI
      </p>
    </main>
  );
}