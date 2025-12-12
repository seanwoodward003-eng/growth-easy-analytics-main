// src/app/pricing/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Pricing • GrowthEasy AI",
  description: "£29.99/mo • 7-day free trial • Cancel anytime",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-cyber-bg via-[#0f1a3d] to-black">
      <div className="text-center max-w-4xl">
        {/* Main Pricing Card */}
        <div className="bg-black/60 backdrop-blur-2xl border-4 border-cyber-neon rounded-3xl p-16 shadow-2xl shadow-cyan-500/20">
          <h1 className="text-8xl md:text-9xl font-black text-cyber-neon animate-glitch mb-8 tracking-tighter">
            £29.<span className="text-6xl">99</span>
            <span className="text-4xl opacity-80">/mo</span>
          </h1>

          <div className="space-y-6 text-2xl md:text-3xl text-cyan-300 mb-16">
            <p>7-day free trial</p>
            <p>No card required</p>
            <p>Cancel anytime</p>
          </div>

          <Link
            href="/login"
            className="inline-block bg-cyber-neon text-black px-20 py-8 rounded-2xl text-4xl font-black hover:scale-110 hover:shadow-cyan-500/50 transition-all duration-300 shadow-2xl"
          >
            Start Free Trial
          </Link>

          <p className="text-cyan-500 text-lg mt-10 opacity-70">
            One price. Unlimited stores. All features forever.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            "Real-time Shopify + GA4 + HubSpot",
            "AI-powered growth insights",
            "Churn prediction & win-back",
            "Revenue forecasting",
            "Unlimited team members",
            "24-hour support",
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-cyber-card/40 border-2 border-cyber-neon rounded-2xl p-8 text-xl backdrop-blur-sm hover:border-cyan-300 transition"
            >
              {feature}
            </div>
          ))}
        </div>

        <p className="text-center text-cyan-600 text-xl mt-20 opacity-60">
          Built for winners • 2025
        </p>
      </div>
    </main>
  );
}