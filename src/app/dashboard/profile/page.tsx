// src/app/dashboard/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen py-20 px-6">
      <h1 className="text-7xl md:text-8xl font-black text-cyber-neon text-center mb-20 animate-glitch">
        USER PROFILE
      </h1>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        {/* User Info Card */}
        <div className="bg-cyber-card/60 backdrop-blur-xl border-4 border-cyber-neon rounded-3xl p-12 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full border-4 border-cyber-neon" />
          <h2 className="text-4xl font-bold text-cyber-neon mb-4">
            {session?.user?.name || "Cyber Operator"}
          </h2>
          <p className="text-2xl text-cyan-300 mb-8">{session?.user?.email || "you@company.com"}</p>
          
          <div className="space-y-4 text-left">
            <div className="flex justify-between text-xl">
              <span className="text-cyan-400">Plan</span>
              <span className="text-green-400 font-bold">Pro Tier</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="text-cyan-400">Status</span>
              <span className="text-green-400">Active • Trial Day 4/7</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="text-cyan-400">Connected</span>
              <span className="text-cyber-neon">Shopify + GA4</span>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="space-y-8">
          <Link
            href="/dashboard/billing"
            className="block bg-cyber-neon text-black px-10 py-6 rounded-2xl text-2xl font-bold text-center hover:scale-105 transition shadow-lg shadow-cyan-500/50"
          >
            Manage Billing
          </Link>

          <Link
            href="/api/auth/signout"
            className="block border-4 border-red-500 text-red-400 px-10 py-6 rounded-2xl text-2xl font-bold text-center hover:bg-red-600 hover:text-white transition"
          >
            Logout
          </Link>

          <div className="bg-black/40 border-2 border-cyber-neon rounded-2xl p-8 text-center">
            <p className="text-xl text-cyan-300">Need help?</p>
            <a href="mailto:support@growtheasy.ai" className="text-2xl text-cyber-neon hover:underline">
              support@growtheasy.ai
            </a>
          </div>
        </div>
      </div>

      <div className="text-center mt-20">
        <p className="text-xl text-cyan-500 opacity-70">
          GrowthEasy AI • Built for winners • 2025
        </p>
      </div>
    </div>
  );
}