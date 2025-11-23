/*====================================================================
  script.js – FINAL VERSION (CONNECT BUTTONS WORK 100%)
====================================================================*/

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

// Fake data for demo
const FAKE = {
  revenue: { total: 12700, trend: '+6%', history: { labels: ['W1','W2','W3','W4'], values: [11500,12000,12400,12700] } },
  churn: { rate: 3.2, at_risk: 18 },
  performance: { ratio: '3' },
  ai_insight: 'Demo mode – connect accounts for real data.'
};

// Cookie-based fetch
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}/${endpoint}`, {
      ...options,
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

// Render dashboard (your original – unchanged)
function renderDashboard(data, isFake = false) {
  const metrics = document.getElementById('dashboard-metrics');
  const insights = document.getElementById('ai-insights');

  if (isFake || data?.error) {
    metrics.innerHTML = `
      <div class="metric-card"><h3>Revenue</h3><p>£12,700</p><p class="trend">+6% (demo)</p></div>
      <div class="metric-card"><h3>Churn Rate</h3><p>3.2%</p><p class="at-risk">18 at risk</p></div>
      <div class="metric-card"><h3>LTV:CAC</h3><p>3:1 (demo)</p></div>
    `;
    insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${FAKE.ai_insight}</p>`;
    drawChart(FAKE.revenue.history.labels, FAKE.revenue.history.values, '+6%');
    return;
  }

  const rev = data.revenue;
  metrics.innerHTML = `
    <div class="metric-card"><h3>Revenue</h3><p>£${rev.total.toLocaleString()}</p><p class="trend">${rev.trend}</p></div>
    <div class="metric-card"><h3>Churn Rate</h3><p>${data.churn.rate}%</p><p class="at-risk">${data.churn.at_risk} at risk</p></div>
    <div class="metric-card"><h3>LTV:CAC</h3><p>${data.performance.ratio}:1</p></div>
  `;
  insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight || 'Analyzing your growth...'}</p>`;
  drawChart(rev.history.labels, rev.history.values, rev.trend);
}

// FINAL CONNECT BUTTON – WORKS EVEN IF POPUP BLOCKED
window.connectProvider = (provider) => {
  let url = `${BACKEND_URL}/auth/${provider}`;

  if (provider === 'shopify') {
    const shop = prompt('Enter your Shopify store (e.g. mystore.myshopify.com)');
    if (!shop || !shop.trim()) return;
    url += `?shop=${encodeURIComponent(shop.trim())}`;
  }

  const popup = window.open(url, 'oauth', 'width=600,height=700,left=300,top=100');

  // If popup is blocked, open in same tab
  setTimeout(() => {
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = url;
    }
  }, 400);

  // Refresh dashboard when popup closes
  const check = setInterval(() => {
    if (popup && popup.closed) {
      clearInterval(check);
      location.reload();  // Full refresh to show new data
    }
  }, 500);
};

// Refresh data
window.refreshData = async () => {
  const btn = document.querySelector('.refresh-btn');
  if (btn) btn.textContent = 'Syncing...';
  await apiFetch('api/sync', { method: 'POST' });
  const data = await apiFetch('api/metrics');
  renderDashboard(data);
  if (btn) btn.textContent = 'Refresh';
};

// AI chat
window.sendChat = async () => {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById('chat-messages');
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  input.value = '';
  chat.scrollTop = chat.scrollHeight;

  const data = await apiFetch('api/chat', { method: 'POST', body: JSON.stringify({ message: msg }) });
  chat.innerHTML += `<div class="ai-msg">${data?.reply || 'Thinking...'}</div>`;
  chat.scrollTop = chat.scrollHeight;
};

// UI visibility
function updateUI() {
  const loggedIn = document.cookie.includes('token=');
  document.getElementById('cta-section')?.style.setProperty('display', loggedIn ? 'none' : 'block');
  document.getElementById('integrations-section')?.style.setProperty('display', loggedIn ? 'block' : 'none');
  document.getElementById('profile-section')?.style.setProperty('display', loggedIn ? 'block' : 'none');
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  if (document.cookie.includes('token=')) {
    refreshData();
  } else {
    renderDashboard(null, true);
  }

  // Mobile menu (your original)
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970; path=/;';
      location.href = 'signup.html';
    });
  });
});