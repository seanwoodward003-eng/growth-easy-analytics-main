"use client";  // ← IMPORTANT: Add this at the top so onClick works!

import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

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
            {session.user.email.split("@")[0] || "Cyber Operator"}
          </h2>
          <p className="text-2xl text-cyan-300 mb-8">{session.user.email || "you@company.com"}</p>
          
          <div className="space-y-6 text-left">
            <div className="flex justify-between text-xl">
              <span className="text-cyan-400">Plan</span>
              <span className="text-green-400 font-bold">Pro Tier</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="text-cyan-400">Status</span>
              <span className="text-green-400">Active • Trial Day 4/7</span>
            </div>

            {/* Glowing OAuth Connect Buttons */}
            <div className="mt-10">
              <h3 className="text-3xl text-cyan-300 text-center mb-8">Connect Platforms</h3>
              <div className="grid grid-cols-1 gap-6">
                <button
                  onClick={() => window.location.href = "/api/auth/shopify"}
                  className="bg-gradient-to-r from-green-600 to-green-400 text-black px-12 py-6 rounded-2xl text-2xl font-bold hover:scale-110 hover:shadow-2xl hover:shadow-green-500/80 transition-all duration-300 shadow-lg"
                >
                  Shopify {session.user?.shopifyConnected ? "✓ Connected" : "Connect Now"}
                </button>

                <button
                  onClick={() => window.location.href = "/api/auth/ga4"}
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 text-black px-12 py-6 rounded-2xl text-2xl font-bold hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/80 transition-all duration-300 shadow-lg"
                >
                  GA4 {session.user?.ga4Connected ? "✓ Connected" : "Connect Now"}
                </button>

                <button
                  onClick={() => window.location.href = "/api/auth/hubspot"}
                  className="bg-gradient-to-r from-orange-600 to-red-500 text-black px-12 py-6 rounded-2xl text-2xl font-bold hover:scale-110 hover:shadow-2xl hover:shadow-orange-500/80 transition-all duration-300 shadow-lg"
                >
                  HubSpot {session.user?.hubspotConnected ? "✓ Connected" : "Connect Now"}
                </button>
              </div>
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
            href="/api/logout"
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