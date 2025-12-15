import "./globals.css";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata = {
  title: 'GrowthEasy AI',
  description: 'AI Growth Coach',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-[#0a0f2c] text-white min-h-screen`}>
        {/* Fixed Top Nav */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f2c]/95 backdrop-blur-md border-b-2 border-cyan-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 glow">GrowthEasy AI</h1>
            <div className="flex items-center gap-6">
              <button className="hidden md:block bg-transparent border-2 border-cyan-400 text-cyan-400 px-6 py-2 rounded-lg text-xl hover:bg-cyan-400/20 transition">
                Logout
              </button>
              <button id="menuBtn" className="md:hidden bg-transparent border-2 border-cyan-400 text-cyan-400 px-6 py-3 rounded-lg text-xl">
                Menu
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobileMenu" className="fixed top-0 right-0 w-80 h-full bg-[#0a0f2c] z-50 transform translate-x-full transition-transform duration-300 border-l-4 border-cyan-400 pt-24 px-8">
          <a href="/dashboard" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Dashboard</a>
          <a href="/churn" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Churn</a>
          <a href="/revenue" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Revenue</a>
          <a href="/acquisition" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Acquisition</a>
          <a href="/retention" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Retention</a>
          <a href="/performance" className="block text-2xl text-cyan-300 py-4 border-b border-cyan-600/50">Performance</a>
          <button className="w-full text-left text-2xl text-cyan-300 py-4">Logout</button>
        </div>

        <main className="pt-24 pb-32">
          {children}
        </main>

        {/* Mobile Menu Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                const btn = document.getElementById('menuBtn');
                const menu = document.getElementById('mobileMenu');
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:40;display:none;backdrop-filter:blur(8px);';
                document.body.appendChild(overlay);

                btn.onclick = () => {
                  menu.style.transform = menu.style.transform === 'translateX(0%)' ? 'translateX(100%)' : 'translateX(0%)';
                  overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
                };
                overlay.onclick = () => {
                  menu.style.transform = 'translateX(100%)';
                  overlay.style.display = 'none';
                };
              });
            `,
          }}
        />
      </body>
    </html>
  );
}