export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl md:text-8xl font-black text-neon animate-glitch mb-8">
        GROWTHEASY AI
      </h1>
      <p className="text-2xl md:text-4xl mb-12 text-cyan-300">
        Stop leaking £800–£8,000/month on churn you don’t see
      </p>

      {/* ONE-CLICK SHOPIFY CONNECT — 60 seconds */}
      <div className="my-16">
        <p className="text-3xl mb-8">See your exact leaks in 17 seconds →</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="text"
            placeholder="yourstore.myshopify.com"
            className="px-8 py-5 text-black rounded-l-xl text-xl w-80"
            id="quickshop"
          />
          <button
            onClick={() => {
              const shop = (document.getElementById('quickshop') as HTMLInputElement)?.value.trim();
              if (shop) {
                window.location.href = `https://growth-easy-analytics-2.onrender.com/auth/shopify?shop=${shop}`;
              }
            }}
            className="bg-neon text-black px-12 py-5 rounded-r-xl sm:rounded-l-none text-2xl font-bold hover:scale-110 transition"
          >
            Connect & Show Me My Leaks
          </button>
        </div>
      </div>

      {/* LIFETIME DEAL PRICING */}
      <div className="my-20 bg-black/60 border-4 border-neon rounded-3xl p-16 max-w-4xl">
        <h2 className="text-7xl font-black text-neon animate-glitch mb-6">
          £37 <span className="text-4xl">one-time</span>
        </h2>
        <p className="text-3xl mb-8">Lifetime access • 7-day money-back guarantee</p>
        <p className="text-4xl text-red-400 animate-pulse mb-8">
          Only ~412 of 500 lifetime spots left
        </p>
        <p className="text-2xl mb-10">
          When 500 sell → price becomes £97/month forever
        </p>
        <a
          href="https://your-stripe-lifetime-link.com"  // ← put your Stripe £37 lifetime link here
          className="inline-block bg-neon text-black px-20 py-8 rounded-2xl text-4xl font-bold hover:scale-110 transition shadow-2xl shadow-cyan-500/50"
        >
          Claim Lifetime Access → £37
        </a>
      </div>

      <p className="text-xl mt-20 text-cyan-400">
        Powered by Grok xAI • Real-time churn detection • No OpenAI
      </p>
    </div>
  );
}