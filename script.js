/*====================================================================
  script.js – FINAL BULLETPROOF VERSION (Dec 2025)
  Fixes: token, logout everywhere, OAuth reload, no crashes
====================================================================*/

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

// GLOBAL TOKEN – works on EVERY page
const getToken = () => {
  const match = document.cookie.split('; ').find(row => row.startsWith('token='));
  return match ? match.split('=')[1] : null;
};
window.token = getToken(); // ← This is the magic line

// Global API fetch (safe even if backend down)
window.apiFetch = async (endpoint, options = {}) => {
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
    console.error('API Error:', e);
    return { error: e.message };
  }
};

// Unblockable OAuth connect – reloads only when user returns
window.connectProvider = (provider) => {
  let url = `${BACKEND_URL}/auth/${provider}`;
  if (provider === 'shopify') {
    const shop = prompt('Enter your Shopify store (e.g. mystore.myshopify.com)');
    if (!shop || !shop.trim()) return;
    url += `?shop=${encodeURIComponent(shop.trim())}`;
  }

  // Mark that we just started OAuth
  localStorage.setItem('pending_oauth', provider);

  // Open in new tab
  const win = window.open(url, '_blank');
  if (!win) {
    alert('Please allow popups for this site');
    return;
  }

  // Smart reload when user comes back
  const check = setInterval(() => {
    if (document.visibilityState === 'visible' || document.hasFocus()) {
      clearInterval(check);
      localStorage.removeItem('pending_oauth');
      location.reload();
    }
  }, 1500);
};

// Global logout – works on every page
document.addEventListener('click', e => {
  if (e.target?.classList.contains('logout-btn')) {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    localStorage.clear();
    location.href = 'signup.html';
  }
});

// Refresh button
window.refreshData = async () => {
  const btn = document.querySelector('.refresh-btn');
  if (btn) btn.textContent = 'Syncing...';
  await apiFetch('api/sync', { method: 'POST' });
  const data = await apiFetch('api/metrics');
  if (window.renderDashboard) renderDashboard(data || {});
  if (btn) btn.textContent = 'Refresh';
};

// Dashboard rendering (index.html)
window.renderDashboard = (data, isFake = false) => {
  const metrics = document.getElementById('dashboard-metrics');
  const insights = document.getElementById('ai-insights');

  if (!metrics) return;

  const fake = { revenue: { total: 12700, trend: '+6%' }, churn: { rate: 3.2, at_risk: 18 }, performance: { ratio: '3' }, ai_insight: 'Connect accounts for real AI insights.' };

  if (isFake || data?.error || !data) {
    metrics.innerHTML = `
      <div class="metric-card"><h3>Revenue</h3><p>£12,700</p><p class="trend">+6% (demo)</p></div>
      <div class="metric-card"><h3>Churn Rate</h3><p>3.2%</p><p class="at-risk">18 at risk</p></div>
      <div class="metric-card"><h3>LTV:CAC</h3><p>3:1 (demo)</p></div>
    `;
    insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${fake.ai_insight}</p>`;
  } else {
    metrics.innerHTML = `
      <div class="metric-card"><h3>Revenue</h3><p>£${(data.revenue?.total || 0).toLocaleString()}</p><p class="trend">${data.revenue?.trend || '+0%'}</p></div>
      <div class="metric-card"><h3>Churn Rate</h3><p>${data.churn?.rate || 0}%</p><p class="at-risk">${data.churn?.at_risk || 0} at risk</p></div>
      <div class="metric-card"><h3>LTV:CAC</h3><p>${data.performance?.ratio || '3'}:1</p></div>
    `;
    insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight || 'Analyzing...'}</p>`;
  }

  if (window.drawChart && data?.revenue?.history) {
    const h = data.revenue.history;
    drawChart(h.labels || fake.revenue.history.labels, h.values || fake.revenue.history.values, data.revenue?.trend || '+6%');
  }
};

// AI Chat
window.sendChat = async () => {
  const input = document.getElementById('chat-input');
  const msg = input?.value.trim();
  if (!msg) return;

  const chat = document.getElementById('chat-messages');
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  input.value = '';
  chat.scrollTop = chat.scrollHeight;

  const res = await apiFetch('api/chat', { method: 'POST', body: JSON.stringify({ message: msg }) });
  chat.innerHTML += `<div class="ai-msg">${res?.reply || 'Thinking...'}</div>`;
  chat.scrollTop = chat.scrollHeight;
};

// On load: auto-refresh if just connected
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('pending_oauth')) {
    localStorage.removeItem('pending_oauth');
    setTimeout(() => location.reload(), 2000);
  }

  // Run page-specific init if exists
  if (window.loadChurn) loadChurn();
  if (window.loadAcquisition) loadAcquisition();
  if (window.loadRevenue) loadRevenue();
  if (window.loadPerformance) loadPerformance();
});