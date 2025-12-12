import { AcquisitionChart } from "@/components/charts/AcquisitionChart";
import { CostTrendChart } from "@/components/charts/CostTrendChart";
import useMetrics from "@/hooks/useMetrics";

export default function AcquisitionPage() {
  const { data } = useMetrics();

  return (
    <>
      <h1 className="text-5xl font-bold text-cyan-400 mb-10">Acquisition</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-cyber-card border-2 border-cyber-neon rounded-2xl p-10 text-center">
          <h3 className="text-2xl text-cyan-300">Acquisition Cost (CAC)</h3>
          <p className="text-7xl font-bold text-cyber-neon mt-6">£{data?.acquisition?.cac || 87}</p>
        </div>
        <div className="bg-cyber-card border-2 border-green-500 rounded-2xl p-10 text-center">
          <h3 className="text-2xl text-green-400">Top Channel</h3>
          <p className="text-6xl font-bold text-green-400 mt-6">{data?.acquisition?.top_channel || "Organic"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <AcquisitionChart />
        <CostTrendChart />
      </div>

      <div className="mt-12 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-cyber-neon rounded-2xl p-10 text-center">
        <h3 className="text-3xl text-cyber-neon mb-4">AI Recommendation</h3>
        <p className="text-2xl">
          {data?.ai_insight || "Focus on Organic — highest ROI. Scale content marketing 2× this month."}
        </p>
      </div>
    </>
  );
}