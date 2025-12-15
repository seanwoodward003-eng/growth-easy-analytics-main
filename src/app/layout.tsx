import './globals.css';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export const metadata = {
  title: 'GrowthEasy AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={orbitron.className}>
        {/* Top Bar */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,15,44,0.95)', backdropFilter: 'blur(10px)', borderBottom: '4px solid #00ffff', padding: '20px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '60px', fontWeight: '900', color: '#00ffff', textShadow: '0 0 40px #00ffff' }}>
              GrowthEasy AI
            </h1>
            <button id="menuBtn" style={{ background: 'transparent', border: '4px solid #00ffff', color: '#00ffff', padding: '16px 40px', borderRadius: '50px', fontSize: '28px', cursor: 'pointer' }}>
              Menu
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <div id="mobileMenu" style={{ position: 'fixed', top: 0, right: 0, width: '300px', height: '100%', background: '#0a0f2c', zIndex: 60, transform: 'translateX(100%)', transition: 'transform 0.4s ease', borderLeft: '4px solid #00ffff', paddingTop: '120px', paddingLeft: '40px' }}>
          <a href="/" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Dashboard</a>
          <a href="/churn" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Churn</a>
          <a href="/revenue" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Revenue</a>
          <a href="/acquisition" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Acquisition</a>
          <a href="/retention" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Retention</a>
          <a href="/performance" style={{ display: 'block', fontSize: '32px', color: '#00ffff', margin: '20px 0' }}>Performance</a>
          <button style={{ display: 'block', fontSize: '32px', color: '#ff4444', background: 'none', border: 'none', margin: '40px 0', cursor: 'pointer' }}>Logout</button>
        </div>

        <main style={{ paddingTop: '140px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </main>

        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('menuBtn');
            const menu = document.getElementById('mobileMenu');
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:40;display:none;backdrop-filter:blur(10px);';
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
        ` }} />
      </body>
    </html>
  );
}