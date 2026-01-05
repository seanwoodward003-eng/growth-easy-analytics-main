'use client';

import { useState } from 'react';

export default function LandingPage() {
  // ... your state and handleSubmit unchanged ...

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center relative overflow-hidden">
      <div className="w-full max-w-xl sm:max-w-3xl lg:max-w-6xl mx-auto z-10 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* Hero - unchanged responsive classes from previous version */}

        {/* CTA Form - unchanged */}

        {/* Urgency - unchanged */}

        {/* Features Grid - unchanged */}

        {/* Pricing Preview - NOW PERFECTLY CENTERED */}
        <div className="w-full">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-cyan-400 mb-10 sm:mb-12">
            Lock In Lifetime Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 justify-items-center">
            <div className="w-full max-w-sm p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-black border-4 border-cyan-400">
              <p className="text-5xl sm:text-6xl font-black text-cyan-400 mb-4">£49</p>
              <p className="text-xl sm:text-2xl text-red-400 mb-6 sm:mb-8">Early Bird • 200 left</p>
              <p className="text-lg sm:text-xl text-cyan-200">One-time payment</p>
            </div>
            <div className="w-full max-w-sm p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-black border-4 border-purple-500">
              <p className="text-5xl sm:text-6xl font-black text-purple-400 mb-4">£79</p>
              <p className="text-xl sm:text-2xl text-purple-300 mb-6 sm:mb-8">Lifetime • Closes at 500</p>
              <p className="text-lg sm:text-xl text-purple-200">One-time payment</p>
            </div>
            <div className="w-full max-w-sm p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-green-900/30 to-black border-4 border-green-500">
              <p className="text-5xl sm:text-6xl font-black text-green-400 mb-4">£490/year</p>
              <p className="text-xl sm:text-2xl text-green-300 mb-6 sm:mb-8">Annual • Save 16%</p>
              <p className="text-lg sm:text-xl text-green-200">= £41/mo</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-cyan-300 mt-10 sm:mt-12">
            7-day money-back guarantee on all plans
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 sm:mt-32 text-center text-cyan-500 text-sm space-x-4 sm:space-x-8">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <p className="mt-4 text-cyan-400">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </footer>
    </main>
  );
}