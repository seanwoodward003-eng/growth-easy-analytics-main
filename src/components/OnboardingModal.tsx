'use client';

import { useState, useEffect } from 'react';
import useMetrics from "@/hooks/useMetrics";

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const { metrics, isLoading } = useMetrics();

  useEffect(() => {
    // Show only on first visit after login
    const hasSeenOnboarding = localStorage.getItem('seenOnboarding');
    if (!hasSeenOnboarding && !isLoading) {
      setShow(true);
    }
  }, [isLoading]);

  if (!show) return null;

  const insights = [
    `Revenue: £${(metrics?.revenue?.total || 12700).toLocaleString()} ${metrics?.revenue?.trend || ''}`,
    `Churn Rate: ${metrics?.churn?.rate || 3.2}% (${metrics?.churn?.at_risk || 18} at risk)`,
    `Top Channel: ${metrics?.acquisition?.top_channel || 'Organic'}`,
  ];

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
          Your AI-powered growth coach is ready. Here's a quick look at your store:
        </p>

        <div className="space-y-10 mb-16">
          {insights.map((insight, i) => (
            <div key={i} className="metric-bubble text-center">
              <p className="text-3xl md:text-4xl text-cyan-300 glow-medium">
                {insight}
              </p>
            </div>
          ))}
        </div>

        <p className="text-3xl md:text-4xl text-center text-cyan-200 mb-16">
          Ask me anything about churn, revenue, acquisition — I'm here to help you grow faster.
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