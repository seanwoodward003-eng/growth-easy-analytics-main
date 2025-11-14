/*====================================================================
  script.js – FINAL LIVE VERSION
  - Cookie-based token
  - OAuth popups + localStorage sync
  - Integration status
  - Real data sync
====================================================================*/

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

// === TOKEN FROM COOKIE ===
function getToken() {
  const name = 'token=';
  const decoded = decodeURIComponent(document.cookie);
  const ca = decoded.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) return c.substring(name.length);
  }
  return null;
}

// === FAKE DATA ===
const FAKE = {
  revenue: { total: 12700, trend: '+6%', history: { labels: ['W1','W2','W3','W4'], values: [11500,12000,12400,12700] } },
  churn: { rate: 3.2, at_risk: 18 },
  performance: { ratio: '3' },
  ai_insight: 'Demo mode – connect accounts for real data.'
};

// === API FETCH ===
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token && !endpoint.includes('health')) {
    return { error: 'No token' };
  }
  try {
    const res = await fetch(`${BACKEND_URL}/${endpoint}`, {
      ...options,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error('API error:', e);
    return { error: e.message };
  }
}

// === RENDER DASHBOARD ===
function renderDashboard(data, isFake = false) {
  const metrics = document.getElementById('dashboard-metrics');
  const insights = document.getElementById('ai-insights');

  if (isFake || data.error) {
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
  insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight}</p>`;
  drawChart(rev.history.labels, rev.history.values, rev.trend);

  // === UPDATE INTEGRATION STATUS ===
  if (data.integrations) {
    const connected = Object.keys(data.integrations)
      .filter(p => data.integrations[p])
      .map(p => p.charAt(0).toUpperCase() + p.slice(1));
    document.getElementById('integration-status').textContent = 
      connected.length > 0 
        ? `Connected: ${connected.join(', ')}` 
        : 'No accounts connected yet.';
  }
}

// === CHART ===
let revenueChart = null;
function drawChart(labels, values, caption) {
  const ctx = document.getElementById('revenueChart')?.getContext('2d');
  if (!ctx) return;
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Revenue', data: values, borderColor: '#00FFFF', backgroundColor: 'rgba(0,255,255,0.1)', fill: true, tension: 0.3 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,255,255,0.1)' }, ticks: { color: '#E0E7FF' } }, x: { grid: { display: false }, ticks: { color: '#E0E7FF' } } } }
  });
  document.getElementById('revenueCaption').textContent = `${caption} this month`;
}

// === AI CHAT ===
window.sendChat = async () => {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  const chat = document.getElementById('chat-messages');
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  input.value = '';
  if (!getToken()) {
    chat.innerHTML += `<div class="ai-msg">Connect accounts to get real AI insights.</div>`;
    chat.scrollTop = chat.scrollHeight;
    return;
  }
  const data = await apiFetch('api/chat', { method: 'POST', body: JSON.stringify({ message: msg }) });
  chat.innerHTML += `<div class="ai-msg">${data.reply || 'AI unavailable'}</div>`;
  chat.scrollTop = chat.scrollHeight;
};

// === OAUTH CONNECT ===
window.connectProvider = (provider) => {
  const token = getToken();
  if (!token) {
    alert('Please sign up first.');
    window.location.href = 'signup.html';
    return;
  }

  let url = `${BACKEND_URL}/auth/${provider}`;
  if (provider === 'shopify') {
    const shop = prompt('Enter your Shopify store (e.g. mystore.myshopify.com):');
    if (!shop || !shop.includes('.')) return alert('Valid store URL required.');
    url += `?shop=${encodeURIComponent(shop)}`;
  }

  const popup = window.open(url, 'oauth', 'width=600,height=700,scrollbars=yes');
  if (!popup) return alert('Popup blocked – allow popups.');

  const handler = (e) => {
    if (e.key === provider && e.newValue === 'connected') {
      localStorage.removeItem(provider);
      window.removeEventListener('storage', handler);
      document.getElementById('integration-status').textContent = 
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected!`;
      setTimeout(refreshData, 1000);
    }
  };
  window.addEventListener('storage', handler);

  const poll = setInterval(() => {
    if (popup.closed) {
      clearInterval(poll);
      window.removeEventListener('storage', handler);
      refreshData();
    }
  }, 1000);
};

// === REFRESH DATA ===
window.refreshData = async () => {
  const btn = document.querySelector('.refresh-btn');
  if (btn) btn.textContent = 'Syncing...';
  const token = getToken();
  if (!token) {
    renderDashboard(null, true);
    return;
  }
  const timeout = setTimeout(() => renderDashboard(null, true), 8000);
  try {
    await apiFetch('api/sync', { method: 'POST' });
    const data = await apiFetch('api/metrics');
    renderDashboard(data);
  } catch (e) {
    renderDashboard(null, true);
  } finally {
    clearTimeout(timeout);
    setTimeout(() => { if (btn) btn.textContent = 'Refresh'; }, 1000);
  }
};

// === LOGOUT ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.clear();
      window.location.href = 'signup.html';
    });
  });
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'dashboard') return;
  const token = getToken();
  if (!token) {
    renderDashboard(null, true);
  } else {
    refreshData();
  }
});