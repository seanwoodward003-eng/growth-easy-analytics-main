import AcquisitionChart from '../components/charts/AcquisitionChart';

export default function Acquisition() {
  return (
    <div className="py-12">
      <h1 className="text-6xl md:text-7xl font-black text-center text-neon mb-16">ACQUISITION</h1>
      <div className="max-w-4xl mx-auto bg-black/30 rounded-2xl p-8 border border-neon mb-12">
        <AcquisitionChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-black/40 border-2 border-neon rounded-2xl p-10 text-center">
          <h3 className="text-2xl">Acquisition Cost</h3>
          <p className="text-5xl font-bold text-neon mt-4">£87</p>
        </div>
        <div className="bg-black/40 border-2 border-green-500 rounded-2xl p-10 text-center">
          <h3 className="text-2xl">Top Channel</h3>
          <p className="text-5xl font-bold text-green-400 mt-4">Organic</p>
        </div>
        <div className="bg-black/40 border-2 border-neon rounded-2xl p-10 text-center">
          <h3 className="text-2xl">AI Recommendation</h3>
          <p className="text-xl mt-4">Double down on Organic — highest ROI</p>
        </div>
      </div>
    </div>
  );
}