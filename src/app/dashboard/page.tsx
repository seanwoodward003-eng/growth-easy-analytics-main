export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Connect Accounts Section */}
      <div className="text-center mt-12 mb-20">
        <h2 className="text-5xl md:text-7xl font-black text-cyan-400 glow-title mb-8">
          Connect Your Accounts
        </h2>
        <p className="text-2xl md:text-4xl text-cyan-200 mb-12 leading-relaxed">
          Shopify, GA4, HubSpot – real data powers<br />AI insights.
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <button className="bg-white text-[#0a0f2c] px-10 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-lg hover:scale-105 transition">
            Connect Shopify
          </button>
          <button className="bg-white text-[#0a0f2c] px-10 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-lg hover:scale-105 transition">
            Connect GA4
          </button>
          <button className="bg-white text-[#0a0f2c] px-10 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-lg hover:scale-105 transition">
            Connect HubSpot
          </button>
        </div>

        <p className="text-2xl md:text-3xl text-cyan-300">Checking connections...</p>
      </div>

      {/* Metric Cards - Stacked */}
      <div className="space-y-16">
        {/* Revenue Card */}
        <div className="bg-[#0f1a3d]/70 backdrop-blur-md border-4 border-cyan-400 rounded-3xl p-12 md:p-20 text-center shadow-2xl shadow-cyan-400/30">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">Revenue</h3>
          <p className="text-7xl md:text-9xl font-black text-cyan-400 glow-number">£12,700</p>
          <p className="text-4xl md:text-6xl text-cyan-300 mt-8">+6% (demo)</p>
        </div>

        {/* Churn Card */}
        <div className="bg-[#0f1a3d]/70 backdrop-blur-md border-4 border-cyan-400 rounded-3xl p-12 md:p-20 text-center shadow-2xl shadow-cyan-400/30">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">Churn Rate</h3>
          <p className="text-7xl md:text-9xl font-black text-cyan-400 glow-number">3.2%</p>
          <p className="text-4xl md:text-6xl text-yellow-400 mt-8">18 at risk</p>
        </div>

        {/* LTV:CAC Card (add if you want, or remove) */}
        <div className="bg-[#0f1a3d]/70 backdrop-blur-md border-4 border-cyan-400 rounded-3xl p-12 md:p-20 text-center shadow-2xl shadow-cyan-400/30">
          <h3 className="text-4xl md:text-5xl text-cyan-300 mb-8">LTV:CAC</h3>
          <p className="text-8xl md:text-10xl font-black text-cyan-400 glow-number">3.4:1</p>
          <p className="text-4xl md:text-5xl text-green-400 mt-8">Healthy</p>
        </div>
      </div>
    </div>
  );
}