'use client';

import useMetrics from "@/hooks/useMetrics";
import { RetentionChart } from "@/components/charts/RetentionChart";
import { AIInsights } from "@/components/AIInsights";

export default function RetentionPage() {
  const { metrics, isLoading, isError, isConnected } = useMetrics();

  return (
    <div className="px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16 text-purple-400">
        Retention
      </h1>

     

      <div className="max-w-4xl mx-auto text-center mb-20">
        <p className="text-5xl text-cyan-300 mb-4">Retention Rate</p>
        <p className="metric-value text-8xl text-purple-400 mb-4">{metrics.retention.rate}%</p>
        <p className="text-xl text-cyan-200">Retention strong — build loyalty programs to boost further</p>
      </div>

      {/* Cohort Table */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 text-center mb-12">Cohort Retention</h2>
        <div className="metric-card p-10">
          <p className="text-2xl text-cyan-200 text-center">
            Month-by-month retention by customer cohort (coming soon — based on first purchase date)
          </p>
          {/* Placeholder table */}
          <div className="mt-8 grid grid-cols-6 gap-4 text-center">
            <div className="text-cyan-300">Cohort</div>
            <div className="text-cyan-300">Month 0</div>
            <div className="text-cyan-300">Month 1</div>
            <div className="text-cyan-300">Month 2</div>
            <div className="text-cyan-300">Month 3</div>
            <div className="text-cyan-300">Month 6</div>
            <div className="text-cyan-200">Jan 2026</div>
            <div className="text-green-400">100%</div>
            <div className="text-green-400">65%</div>
            <div className="text-yellow-400">48%</div>
            <div className="text-yellow-400">35%</div>
            <div className="text-red-400">22%</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-20 metric-card p-8">
        <RetentionChart />
      </div>

      {/* AI Insights — no page prop */}
      <AIInsights />
    </div>
  );
}