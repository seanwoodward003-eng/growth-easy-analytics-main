// app/pricing/page.tsx
export default function Pricing() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-black/60 border-4 border-neon rounded-3xl p-16 text-center max-w-2xl">
        <h1 className="text-6xl font-black text-neon mb-8 animate-glitch">£29.99 / month</h1>
        <p className="text-2xl mb-12">7-day free trial • Cancel anytime • No card required</p>
        <a href="/api/signup" className="bg-neon text-black px-16 py-8 rounded-xl text-3xl font-bold hover:scale-105 transition inline-block">
          Start Free Trial
        </a>
      </div>
    </div>
  );
}