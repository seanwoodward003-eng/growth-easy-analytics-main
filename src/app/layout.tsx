import "./globals.css";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export const metadata = {
  title: 'GrowthEasy AI',
  description: 'AI Growth Coach',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-[#0a0f2c] text-white min-h-screen relative`}>
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f2c]/90 backdrop-blur-lg border-b-2 border-cyan-400">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-cyan-400 glow-title">
                GrowthEasy AI
              </h1>
            </div>
            <button id="menuBtn" className="bg-transparent border-2 border-cyan-400 text-cyan-400 px-8 py-3 rounded-xl text-2xl font-medium hover:bg-cyan-400/20 transition">
              Menu
            </button>
          </div>
        </header>

        {/* User Email + Logout (shown after top bar) */}
        <div className="pt-24 px-6">
          <p className="text-xl md:text-2xl text-cyan-200 mb-2">
            seanwoodward2023@gmail.com
          </p>
          <button className="bg-transparent border-2 border-cyan-400 text-cyan-400 px-8 py-3 rounded-xl text-xl hover:bg-cyan-400/20 transition mb-10">
            Logout
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobileMenu" className="fixed top-0 right-0 w-80 h-full bg-[#0a0f2c]/98 backdrop-blur-xl z-50 transform translate-x-full transition-transform duration-400 border-l-4 border-cyan-400 pt-32 px-8 overflow-y-auto">
          <div className="space-y-4">
            <a href="/dashboard" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Dashboard</a>
            <a href="/churn" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Churn</a>
            <a href="/revenue" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Revenue</a>
            <a href="/acquisition" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Acquisition</a>
            <a href="/retention" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Retention</a>
            <a href="/performance" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">Performance</a>
            <a href="/about" className="block text-3xl text-cyan-300 py-4 border-b border-cyan-600/50">About</a>
            <button className="w-full text-left text-3xl text-red-400 py-4">Logout</button>
          </div>
        </div>

        <main className="px-6 pb-32">
          {children}
        </main>

        {/* Mobile Menu Overlay + Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                const btn = document.getElementById('menuBtn');
                const menu = document.getElementById('mobileMenu');
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:40;display:none;backdrop-filter:blur(10px);';
                document.body.appendChild(overlay);

                const toggle = () => {
                  const isOpen = menu.style.transform === 'translateX(0%)';
                  menu.style.transform = isOpen ? 'translateX(100%)' : 'translateX(0%)';
                  overlay.style.display = isOpen ? 'none' : 'block';
                };

                btn.onclick = toggle;
                overlay.onclick = toggle;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}