import RevenueChart from '@/components/charts/RevenueChart';

export default function Dashboard() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-black text-neon my-12 animate-glitch">DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-black/40 border-2 border-neon rounded-2xl p-10">
          <h3>Revenue</h3><p className="text-5xl font-bold my-4">£12,700</p><p className="text-green-400">+6%</p>
        </div>
        <div className="bg-black/40 border-2 border-red-500 rounded-2xl p-10">
          <h3>Churn Rate</h3><p className="text-5xl font-bold my-4 text-red-400">3.2%</p><p className="text-yellow-400">18 at risk</p>
        </div>
        <div className="bg-black/40 border-2 border-neon rounded-2xl p-10">
          <h3>LTV:CAC</h3><p className="text-5xl font-bold my-4">3:1</p>
        </div>
      </div>

      <div className="my-20 bg-black/30 rounded-2xl p-8 border border-neon">
        <RevenueChart />
      </div>

      <div className="my-20">
        <h2 className="text-4xl mb-10">Connect Accounts</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <a href="https://growth-easy-analytics-2.onrender.com/auth/shopify" target="_blank" className="bg-neon text-black px-10 py-5 rounded-xl text-xl font-bold hover:bg-cyan-300">Connect Shopify</a>
          <a href="https://growth-easy-analytics-2.onrender.com/auth/ga4" target="_blank" className="bg-neon text-black px-10 py-5 rounded-xl text-xl font-bold hover:bg-cyan-300">Connect GA4</a>
          <a href="https://growth-easy-analytics-2.onrender.com/auth/hubspot" target="_blank" className="bg-neon text-black px-10 py-5 rounded-xl text-xl font-bold hover:bg-cyan-300">Connect HubSpot</a>
        </div>
      </div>
    </div>
  );
}