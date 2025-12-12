import RevenueChart from '../components/charts/RevenueChart';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-dark to-black">
      <h1 className="text-6xl md:text-8xl font-black text-neon animate-glitch mb-8">
        GROWTHEASY AI
      </h1>
      <p className="text-2xl md:text-4xl mb-4 text-cyan-300">
        Powered by Grok xAI • Real-time churn detection
      </p>
      <div className="flex items-center gap-6 mb-12">
        <img src="https://x.ai/grok-badge.png" alt="Grok xAI" className="h-12" />
        <span className="text-xl text-cyan-400">No OpenAI • Real Grok answers</span>
      </div>

      <div className="my-16">
        <p className="text-3xl mb-8">See your exact monthly leak in 17 seconds</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input type="text" placeholder="yourstore.myshopify.com" className="px-8 py-5 text-black rounded-l-xl text-xl w-80" id="quickshop" />
          <button 
            onClick={() => {
              const shop = (document.getElementById('quickshop') as HTMLInputElement)?.value.trim();
              if (shop) window.location.href = `https://growth-easy-analytics-2.onrender.com/auth/shopify?shop=${shop}`;
            }} 
            className="bg-neon text-black px-12 py-5 rounded-r-xl sm:rounded-l-none text-2xl font-bold hover:scale-110 transition"
          >
            Connect & Show My Leaks
          </button>
        </div>
      </div>

      <div className="my-20 bg-black/70 border-4 border-neon rounded-3xl p-16 max-w-4xl">
        <h2 className="text-7xl font-black text-neon animate-glitch mb-6">£37 <span className="text-4xl">one-time</span></h2>
        <p className="text-3xl mb-8">Lifetime access • 7-day money-back</p>
        <p className="text-4xl text-red-400 animate-pulse mb-8">Only ~418 of 500 lifetime spots left</p>
        <p className="text-2xl mb-10">When 500 sell → price becomes £97/month forever</p>
        <a href="https://buy.stripe.com/your_link_here" className="inline-block bg-neon text-black px-20 py-8 rounded-2xl text-4xl font-bold hover:scale-110 transition shadow-2xl shadow-cyan-500/50">
          Claim Lifetime Access → £37
        </a>
      </div>
    </div>
  );
}