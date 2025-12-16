export default function About() {
  return (
    <div className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16">
        About GrowthEasy AI
      </h1>

      <div className="max-w-5xl mx-auto space-y-12 text-lg md:text-xl leading-relaxed text-cyan-100">
        <p>
          GrowthEasy AI was born from a simple but powerful realisation: most Shopify store owners are drowning in data but starving for insights. You have Shopify orders, GA4 traffic, HubSpot contacts — all the raw numbers — but turning them into actionable growth strategies is hard, time-consuming, and often left to expensive consultants. We built GrowthEasy AI to change that. Our mission is to democratise advanced growth analytics by combining real-time data integration with an AI coach that understands your business like a human expert would. Whether you're a solo founder or running a 7-figure store, you deserve clear, personalised advice on churn, acquisition, retention, revenue, and performance — without the complexity or cost of traditional tools.
        </p>

        <p>
          Built with a cyberpunk-inspired design, GrowthEasy AI isn't just functional — it's designed to feel futuristic and inspiring. We believe analytics should be beautiful and intuitive, not sterile spreadsheets. Every chart, metric, and AI insight is crafted to give you that "aha" moment quickly. Behind the scenes, we securely connect to your Shopify, Google Analytics 4, and HubSpot accounts to pull real data (never stored long-term, always encrypted). Our AI Growth Coach analyses your numbers in real-time and gives you specific, actionable recommendations — like "Send a win-back campaign to these 18 at-risk customers" or "Double down on organic content — it's driving 42% of your revenue". We're in beta, constantly improving, and obsessed with helping Shopify brands grow faster, smarter, and with less stress. Welcome to the future of e-commerce growth.
        </p>
      </div>

      <div className="text-center mt-20">
        <p className="text-2xl text-cyan-400 glow-medium">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </div>
    </div>
  );
}