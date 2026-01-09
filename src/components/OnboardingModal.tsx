'use client';

import { useState, useEffect } from 'react';
import useMetrics from "@/hooks/useMetrics";

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const { 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    isLoading 
  } = useMetrics();

  useEffect(() => {
    const hasSeen = localStorage.getItem('seenOnboarding');
    const anyConnected = shopifyConnected || ga4Connected || hubspotConnected;

    // Show only on first visit AND no integrations connected yet
    if (!hasSeen && !anyConnected && !isLoading) {
      setShow(true);
    }
  }, [shopifyConnected, ga4Connected, hubspotConnected, isLoading]);

  if (!show) return null;

  const handleStart = () => {
    localStorage.setItem('seenOnboarding', 'true');
    setShow(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f2c]/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-cyber-card/80 border-4 border-cyan-400 rounded-3xl p-10 md:p-16 shadow-2xl shadow-cyan-400/50">
        <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-12">
          Welcome to GrowthEasy AI
        </h1>

        <p className="text-3xl md:text-4xl text-center text-cyan-200 mb-16 leading-relaxed">
          Your AI-powered growth coach is ready. Connect your accounts to unlock real-time insights, churn alerts, revenue growth, and more.
        </p>

        <div className="text-center">
          <button 
            onClick={handleStart}
            className="cyber-btn text-3xl md:text-4xl px-16 py-8"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}