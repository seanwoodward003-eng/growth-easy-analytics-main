// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import ChartProvider from '../components/ChartProvider';

export const metadata: Metadata = {
  title: 'GrowthEasy AI',
  description: 'AI-powered growth analytics for Shopify stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ChartProvider>
          <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b-2 border-neon">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
              <h1 className="text-2xl md:text-3xl font-bold text-neon">GrowthEasy AI</h1>

              <div className="hidden md:flex gap-8 text-lg">
                {['/', '/churn', '/acquisition', '/retention', '/revenue', '/performance', '/about', '/profile'].map((path) => {
                  const name = path === '/' ? 'Dashboard' : path === '/profile' ? 'Profile' : path.slice(1).charAt(0).toUpperCase() + path.slice(2);
                  return <a key={path} href={path} className="hover:text-neon transition">{name}</a>;
                })}
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

          <main className="max-w-7xl mx-auto px-6 py-10">
            {children}
          </main>
        </ChartProvider>
      </body>
    </html>
  );
}