// static/script.js — FINAL: FULL BACKEND SYNC + ALL FIXES
const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';  // Backend URL
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

// OAUTH BUTTONS
window.connectShopify = () => {
  const shop = prompt("Enter your Shopify store (e.g. mystore.myshopify.com)");
  if (shop) window.location.href = `${BACKEND_URL}/auth/shopify?shop=${encodeURIComponent(shop)}`;
};
window.connectHubSpot = () => window.location.href = `${BACKEND_URL}/auth/hubspot`;
window.connectGA4 = () => window.location.href = `${BACKEND_URL}/auth/ga4`;

// BUTTONS
window.logout = () => {
  localStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/signup.html';
};
window.refreshData = () => location.reload();
window.profile = () => {
  if (!token) {
    window.location.href = '/signup.html';
  } else {
    fetch(`${BACKEND_URL}/api/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      alert(`Profile: ID ${data.id}, Email ${data.email}, Connected: Shopify ${data.shopify_shop ? 'Yes' : 'No'}, GA4 ${data.ga4_connected ? 'Yes' : 'No'}, HubSpot ${data.hubspot_connected ? 'Yes' : 'No'}`);
    }).catch(e => alert('Error loading profile'));
  }
};

// MOBILE MENU (FIXED — WORKS ON ALL PAGES)
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);

  const style = document.createElement('style');
  style.textContent = `
    .mobile-overlay { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); z-index:999; }
    .mobile-overlay.open { display:block; }
    .mobile-menu { transform:translateY(-100%); transition:transform 0.3s ease; position:fixed; top:0; right:0; width:280px; height:100vh; background:var(--card); padding:2rem; z-index:1000; }
    .mobile-menu.open { transform:translateY(0); }
  `;
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

  mobileMenu.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      overlay.className = 'mobile-overlay';
      menuBtn.textContent = 'Menu';
    });
  });
});

// AI CHAT — REAL BACKEND SYNC
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

// DASHBOARD — REAL DATA + FAKE FOR NEWCOMERS
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const path = window.location.pathname;
  if (path === '/') loadDashboard();
  if (path === '/churn.html') loadChurn();
  if (path === '/revenue.html') loadRevenue();
  if (path === '/acquisition.html') loadAcquisition();
  if (path === '/retention.html') loadRetention();
  if (path === '/performance.html') loadPerformance();
});

// LOAD DASHBOARD (REAL + FAKE METRICS)
async function loadDashboard() {
  const data = await fetchMetrics();
  const metricsDiv = document.getElementById('dashboard-metrics');
  const insightsDiv = document.getElementById('ai-insights');

  if (data.error || data.revenue.total === 0) {
    // FAKE METRICS FOR NEWCOMERS
    metricsDiv.innerHTML = `
      <div class="metric-card">
        <h3>Revenue</h3>
        <p>£12,700</p>
        <p class="trend">+6% (demo)</p>
      </div>
      <div class="metric-card">
        <h3>Churn Rate</h3>
        <p>3.2%</p>
        <p class="at-risk">18 at risk</p>
      </div>
      <div class="metric-card">
        <h3>LTV:CAC</h3>
        <p>3:1 (demo)</p>
      </div>
    `;
    insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> Demo mode — connect accounts for real data.</p>`;
    return;
  }

  // REAL DATA
  metricsDiv.innerHTML = `
    <div class="metric-card">
      <h3>Revenue</h3>
      <p>£${data.revenue.total}</p>
      <p class="trend">${data.revenue.trend}</p>
    </div>
    <div class="metric-card">
      <h3>Churn Rate</h3>
      <p>${data.churn.rate}%</p>
      <p class="at-risk">${data.churn.at_risk} at risk</p>
    </div>
    <div class="metric-card">
      <h3>LTV:CAC</h3>
      <p>${data.performance?.ratio || '--'}:1</p>
    </div>
  `;
  insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight}</p>`;
}

// LOAD CHURN
async function loadChurn() {
  const data = await fetchMetrics();
  document.getElementById('churn-rate').textContent = `${data.churn?.rate || 0}%`;
  document.getElementById('at-risk').textContent = data.churn?.at_risk || 0;
  document.getElementById('ai-insight').textContent = data.ai_insight || "No insights yet.";
}

// LOAD REVENUE
async function loadRevenue() {
  const data = await fetchMetrics();
  document.getElementById('revenue-total').textContent = `£${data.revenue?.total || 0}`;
  document.getElementById('revenue-trend').textContent = data.revenue?.trend || '0%';
  document.getElementById('ai-insight').textContent = data.ai_insight || "No insights yet.";
}

// LOAD ACQUISITION
async function loadAcquisition() {
  const data = await fetchMetrics();
  document.getElementById('acquisition-cost').textContent = `£${data.acquisition?.cost || 87}`;
  document.getElementById('top-channel').textContent = data.acquisition?.top_channel || 'Organic';
  document.getElementById('ai-insight').textContent = data.ai_insight || "Focus on organic for ROI.";
}

// LOAD RETENTION
async function loadRetention() {
  const data = await fetchMetrics();
  document.getElementById('retention-rate').textContent = `${data.retention?.rate || 85}%`;
  document.getElementById('at-risk').textContent = data.retention?.at_risk || 10;
  document.getElementById('ai-insight').textContent = data.ai_insight || "Send re-engagement email to 10 at-risk.";
}

// LOAD PERFORMANCE
async function loadPerformance() {
  const data = await fetchMetrics();
  document.getElementById('ltv').textContent = `£${data.performance?.ltv || 150}`;
  document.getElementById('cac').textContent = `£${data.performance?.cac || 50}`;
  document.getElementById('ratio').textContent = `${data.performance?.ratio || '3'}:1`;
  document.getElementById('ai-insight').textContent = data.ai_insight || "Healthy LTV:CAC—keep scaling.";
}