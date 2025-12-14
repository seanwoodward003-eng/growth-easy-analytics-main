// src/app/dashboard/page.tsx
import { RevenueChart } from "@/components/charts/RevenueChart";
import dynamic from "next/dynamic";


export default function Dashboard() {
  const { data, isLoading } = useMetrics();

  return (
    <>
      {/* Profile Section */}
      <div className="mb-12 bg-cyber-card/60 border border-cyber-neon rounded-2xl p-8">
        <h2 className="text-4xl font-bold text-cyber-neon mb-4">Your Profile</h2>
        <p className="text-2xl text-cyan-300 mb-4">
          {data?.user?.email || "seanwoodward23@gmail.com"}
        </p>
        <button className="bg-transparent border-2 border-cyber-neon text-cyber-neon px-8 py-3 rounded-full text-xl font-bold hover:bg-cyber-neon hover:text-black transition">
          Logout
        </button>
      </div>

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* Metrics Grid – BIG GLOWING BUBBLES LIKE ORIGINAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
        {/* Revenue Bubble */}
        <div className="bg-cyber-card/80 backdrop-blur-sm border-2 border-cyber-neon rounded-3xl p-10 text-center shadow-2xl shadow-cyber-neon/20">
          <h3 className="text-3xl text-cyan-400 mb-4">Revenue</h3>
          <p className="text-6xl font-bold text-cyber-neon">
            £{(data?.revenue.total || 12700).toLocaleString()}
          </p>
          <p className="text-4xl text-green-400 mt-4">
            {data?.revenue.trend || "+6%"} (demo)
          </p>
        </div>

        {/* Churn Bubble */}
        <div className="bg-cyber-card/80 backdrop-blur-sm border-2 border-red-500 rounded-3xl p-10 text-center shadow-2xl shadow-red-500/20">
          <h3 className="text-3xl text-cyan-400 mb-4">Churn Rate</h3>
          <p className="text-6xl font-bold text-red-400">
            {data?.churn.rate || 3.2}%
          </p>
          <p className="text-3xl text-red-300 mt-4">
            {data?.churn.at_risk || 18} at risk
          </p>
        </div>

        {/* LTV:CAC Bubble */}
        <div className="bg-cyber-card/80 backdrop-blur-sm border-2 border-cyber-neon rounded-3xl p-10 text-center shadow-2xl shadow-cyber-neon/20">
          <h3 className="text-3xl text-cyan-400 mb-4">LTV:CAC</h3>
          <p className="text-7xl font-bold text-cyber-neon">
            {data?.performance.ratio || "3.0"}:1
          </p>
          <p className="text-3xl text-green-400 mt-4">Healthy</p>
        </div>
      </div>
    </>
  );
}