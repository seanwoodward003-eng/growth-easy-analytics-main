// static/script.js — FINAL: CONNECTED TO RENDER BACKEND
const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';  // Your backend
let token = localStorage.getItem('token');

function requireAuth() {
  if (!token) {
    window.location.href = '/signup.html';
    return false;
  }
  return true;
}

async function fetchMetrics() {
  if (!token) return { error: "No token" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : { error: "Failed" };
  } catch { return { error: "Offline" }; }
}

window.connectShopify = () => {
  const shop = prompt("Enter your Shopify store (e.g., mystore.myshopify.com)");
  if (shop) window.location.href = `${BACKEND_URL}/auth/shopify?shop=${encodeURIComponent(shop)}`;
};
window.connectHubSpot = () => window.location.href = `${BACKEND_URL}/auth/hubspot`;
window.connectGA4 = () => window.location.href = `${BACKEND_URL}/auth/ga4`;
window.logout = () => { localStorage.removeItem('token'); window.location.href = '/signup.html'; };
window.refreshData = () => location.reload();

// MOBILE MENU
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);
  const style = document.createElement('style');
  style.textContent = `.mobile-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:999;}.mobile-overlay.open{display:block;}`;
  document.head.appendChild(style);

  menuBtn.addEventListener('click', e => {
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

// AI CHAT — TO BACKEND
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');

if (sendBtn && input && messages) {
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
}

async function sendMessage() {
  const q = input.value.trim();
  if (!q) return;

  messages.innerHTML += `<p style="background:#00FFFF;color:#0a0f2c;margin-left:auto;max-width:85%;padding:0.6rem 1rem;border-radius:12px;margin:0.5rem 0;word-wrap:break-word;">${q}</p>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: q })
    });
    const data = await res.json();
    const reply = data.reply || "AI thinking...";

    messages.innerHTML += `<p style="background:rgba(255,255,255,0.1);max-width:85%;padding:0.6rem 1rem;border-radius:12px;margin:0.5rem 0;word-wrap:break-word;">${reply}</p>`;
    messages.scrollTop = messages.scrollHeight;
  } catch {
    messages.innerHTML += `<p style="color:#e74c3c;">Backend error. Try again.</p>`;
  }
}

// LOAD DATA ON DASHBOARD
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const path = window.location.pathname;
  if (path === '/') loadDashboard();
});

// DASHBOARD — REAL DATA
async function loadDashboard() {
  const data = await fetchMetrics();
  const metricsDiv = document.getElementById('dashboard-metrics');
  const insightsDiv = document.getElementById('ai-insights');

  if (data.error === "Connect Shopify first") {
    metricsDiv.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <h3>Connect Your Accounts</h3>
        <p>Unlock real-time insights.</p>
        <button onclick="connectShopify()" style="margin:0.5rem;padding:1rem 2rem;background:#00ffff;color:#0a0f2c;border:none;border-radius:12px;font-weight:bold;cursor:pointer;">Connect Shopify</button>
        <button onclick="connectHubSpot()" style="margin:0.5rem;padding:1rem 2rem;background:#00ffff;color:#0a0f2c;border:none;border-radius:12px;font-weight:bold;cursor:pointer;">Connect HubSpot</button>
        <button onclick="connectGA4()" style="margin:0.5rem;padding:1rem 2rem;background:#00ffff;color:#0a0f2c;border:none;border-radius:12px;font-weight:bold;cursor:pointer;">Connect GA4</button>
      </div>`;
    return;
  }

  if (data.error) {
    metricsDiv.innerHTML = `<p class="error">${data.error}</p>`;
    return;
  }

  metricsDiv.innerHTML = `
    <div class="metric-card">
      <h3>Revenue</h3>
      <p>£${data.revenue?.total || 0}</p>
      <p class="trend">${data.revenue?.trend || ''}</p>
    </div>
    <div class="metric-card">
      <h3>Churn Rate</h3>
      <p>${data.churn?.rate || 0}%</p>
      <p class="at-risk">${data.churn?.at_risk || 0} at risk</p>
    </div>
    <div class="metric-card">
      <h3>LTV:CAC</h3>
      <p>${data.performance?.ratio || '--'}:1</p>
    </div>
  `;

  insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight || 'Connected data for insights'}</p>`;
}

// OTHER PAGES (ADD SIMILAR FUNCTIONS)
async function loadChurn() {
  const data = await fetchMetrics();
  document.getElementById('churn-rate').textContent = `${data.churn?.rate || 0}%`;
  document.getElementById('at-risk').textContent = data.churn?.at_risk || 0;
  document.getElementById('ai-insight').textContent = data.ai_insight || "No insights.";
}