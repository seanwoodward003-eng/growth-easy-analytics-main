// app/churn/page.tsx
import ChurnChart from '../components/charts/ChurnChart';

export default function Churn() {
  return (
    <div className="text-center">
      <h1 className="text-7xl font-black text-red-400 my-16 animate-glitch">CHURN RATE</h1>
      <div className="max-w-4xl mx-auto bg-black/30 rounded-2xl p-8 border-2 border-red-600">
        <ChurnChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto mt-20">
        <div className="bg-black/50 border-4 border-red-600 rounded-2xl p-12">
          <h3 className="text-3xl">Current Churn</h3>
          <p className="text-7xl font-bold text-red-400 my-6">3.2%</p>
          <p>£400/mo lost</p>
        </div>
        <div className="bg-black/50 border-4 border-yellow-500 rounded-2xl p-12">
          <h3 className="text-3xl">At-Risk Customers</h3>
          <p className="text-7xl font-bold text-yellow-400 my-6">18</p>
          <button className="mt-8 bg-red-600 hover:bg-red-500 px-10 py-4 rounded-xl text-xl">Send Win-Back</button>
        </div>
      </div>
    </div>
  );
}