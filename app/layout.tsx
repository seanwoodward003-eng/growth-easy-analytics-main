import '../app/globals.css';
import type { Metadata } from 'next';
import ChartProvider from '../components/ChartProvider';

export const metadata: Metadata = {
  title: 'GrowthEasy AI',
  description: 'AI-powered growth analytics for Shopify stores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ChartProvider>
          <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b-2 border-neon">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
              <h1 className="text-2xl md:text-3xl font-bold text-neon">GrowthEasy AI</h1>
              <div className="hidden md:flex gap-8 text-lg">
                <a href="/" className="hover:text-neon transition">Dashboard</a>
                <a href="/churn" className="hover:text-neon transition">Churn</a>
                <a href="/acquisition" className="hover:text-neon transition">Acquisition</a>
                <a href="/retention" className="hover:text-neon transition">Retention</a>
                <a href="/revenue" className="hover:text-neon transition">Revenue</a>
                <a href="/performance" className="hover:text-neon transition">Performance</a>
                <a href="/about" className="hover:text-neon transition">About</a>
                <a href="/profile" className="hover:text-neon transition">Profile</a>
              </div>
              <button className="md:hidden text-neon text-3xl" onClick={() => document.getElementById('mobile')?.classList.toggle('hidden')}>
                Menu
              </button>
            </div>
            <div id="mobile" className="hidden md:hidden bg-black/95 border-t-2 border-neon p-6">
              <div className="flex flex-col gap-6 text-xl">
                <a href="/">Dashboard</a>
                <a href="/churn">Churn</a>
                <a href="/acquisition">Acquisition</a>
                <a href="/retention">Retention</a>
                <a href="/revenue">Revenue</a>
                <a href="/performance">Performance</a>
                <a href="/about">About</a>
                <a href="/profile">Profile</a>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        </ChartProvider>
      </body>
    </html>
  );
}