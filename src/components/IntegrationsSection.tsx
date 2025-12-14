"use client";

export function IntegrationsSection() {
  const handleConnect = (provider: string) => {
    if (provider === "shopify") {
      const shop = prompt("Enter your .myshopify.com store name");
      if (!shop) return;
      window.location.href = `https://growth-easy-analytics-2.onrender.com/auth/shopify?shop=${encodeURIComponent(shop.trim())}`;
    } else {
      window.location.href = `https://growth-easy-analytics-2.onrender.com/auth/${provider}`;
    }
  };

  return (
    <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-10">
      <h2 className="text-4xl font-bold text-[#00ffff] text-center mb-6">
        Connect Your Accounts
      </h2>
      <p className="text-xl text-center text-cyan-300 mb-10">
        Shopify, GA4, HubSpot – real data powers AI insights.
      </p>

      <div className="flex flex-wrap justify-center gap-8 mb-8">
        <button onClick={() => handleConnect("shopify")} className="bg-white text-[#00ffff] px-10 py-5 rounded-full text-xl font-bold hover:bg-cyan-50 transition">
          Connect Shopify
        </button>
        <button onClick={() => handleConnect("ga4")} className="bg-white text-[#00ffff] px-10 py-5 rounded-full text-xl font-bold hover:bg-cyan-50 transition">
          Connect GA4
        </button>
        <button onClick={() => handleConnect("hubspot")} className="bg-white text-[#00ffff] px-10 py-5 rounded-full text-xl font-bold hover:bg-cyan-50 transition">
          Connect HubSpot
        </button>
      </div>

      <p className="text-center text-cyan-400 text-lg">
        Checking connections...
      </p>
    </div>
  );
}