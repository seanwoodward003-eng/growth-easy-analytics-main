import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-cyber-bg via-[#0f1a3d] to-black">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-bold text-cyber-neon animate-glitch mb-10">
          GROWTHEASY AI
        </h1>
        <p className="text-2xl md:text-4xl text-cyan-300 mb-12">
          AI-Powered Growth Analytics for Shopify Stores
        </p>
        <div className="space-x-8">
          <Link href="/dashboard" className="bg-cyber-neon text-black px-12 py-6 rounded-xl text-2xl font-bold hover:scale-110 transition">
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
