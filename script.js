// static/script.js
let token = localStorage.getItem('token');

function requireAuth() {
  if (!token) { window.location.href = '/signup.html'; return false; }
  return true;
}

async function fetchMetrics() {
  if (!token) return { error: "No token" };
  try {
    const res = await fetch('/api/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : { error: "Failed" };
  } catch { return { error: "Offline" }; }
}

window.connectShopify = () => {
  const shop = prompt("Enter your Shopify store (e.g. mystore.myshopify.com)");
  if (shop) window.location.href = `/auth/shopify?shop=${encodeURIComponent(shop)}`;
};
window.connectHubSpot = () => window.location.href = '/auth/hubspot';
window.connectGA4 = () => window.location.href = '/auth/ga4';
window.logout = () => { localStorage.removeItem('token'); window.location.href = '/signup.html'; };
window.refreshData = () => location.reload();

// Mobile Menu
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);
  const style = document.createElement('style');
  style.textContent = `.mobile-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:999;}.mobile-overlay.open{display:block;}`;
  document.head.appendChild(style);

  menuBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const open = mobileMenu.classList.toggle('open');
    overlay.classList.toggle('open', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });
  overlay.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('open');
    menuBtn.textContent = 'Menu';
  });
});