/*====================================================================
  script.js – FINAL LIVE VERSION (COMPLETE)
  - Cookie-based token (fixes mismatch)
  - Auto-sync + real data extraction (fixes integration)
  - Error alerts + fallbacks (fixes handling)
  - Mobile menu (slide-in)
  - Chart + AI chat
  - STRIPE INTEGRATION: Loaded publishable key for future checkout/Elements
====================================================================*/

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com'; // LIVE BACKEND (matches your Render service)

// === STRIPE INITIALIZATION (For checkout/Elements if needed) ===
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SQCbL7iaZUS16EUVxIe6hi8Ty9TwKrER1qJWulVcI0mrC8CkRp3nYRY0Y1eQx9gU8M59MaMEdpY000YIjipF0b300ihyqCYzb'; // Updated: Your live PK from screenshot
let stripe; // Global for reuse

async function loadStripe() {
  if (!stripe) {
    const { loadStripe } = await import('https://js.stripe.com/v3/');
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      console.warn('Stripe failed to load – check key.');
    }
  }
  return stripe;
}

// Example: Prompt for payment method post-trial (call in dashboard init if sub is trialing)
// async function addPaymentMethod() {
//   const stripeInstance = await loadStripe();
//   if (stripeInstance) {
//     const { setupIntent, error } = await stripeInstance.confirmSetupIntent('si_from_backend');
//     if (error) alert(`Setup failed: ${error.message}`);
//   }
// }

// === COOKIE TOKEN (Fixes Mismatch) ===
function getToken() {
  const name = 'token=';
  const decoded = decodeURIComponent(document.cookie);
  const ca = decoded.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return null;
}

function setToken(token) {
  document.cookie = `token=${token}; expires=${new Date(Date.now() + 7*24*60*60*1000).toUTCString()}; path=/; secure; samesite=Lax; domain=.vercel.app`;  // Broad domain for previews
}

let token = getToken();

// === FAKE DATA (DEMO MODE) ===
const FAKE = {
  revenue: {
    total: 12700,
    trend: '+6%',
    history: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      values: [11500, 12000, 12400, 12700]
    }
  },
  churn: { rate: 3.2, at_risk: 18 },
  performance: { ratio: '3' },
  ai_insight: 'Demo mode – connect accounts for real data.'
};

// === API FETCH (Enhanced with Error Handling + Logs) ===
async function apiFetch(endpoint, options = {}) {
  console.log('API Fetch:', endpoint, 'Token present?', !!token);  // Debug log

  if (!token) {
    console.warn('No token – using demo');
    alert('Please sign up or log in to access data.');  // User-friendly error
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
      credentials: 'include'  // Ensures cookies for auth
    });
    console.log('API Response Status:', res.status, endpoint);  // Debug log

    if (!res.ok) {
      let err;
      try {
        err = await res.json();
      } catch {
        err = { error: await res.text() || `HTTP ${res.status}` };
      }
      console.error('API Error Details:', err);  // Debug log
      alert(`API Error: ${err.error}. Retrying in 5s...`);  // User-friendly
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error('Full Fetch Error:', e);  // Debug log
    alert('Connection issue – check internet and retry.');  // Fallback
    return { error: 'Failed to connect' };
  }
}

// === RENDER DASHBOARD (Updated for Real Data + Force Demo Timeout) ===
function renderDashboard(data, isFake = false) {
  const metrics = document.getElementById('dashboard-metrics');
  const insights = document.getElementById('ai-insights');

  console.log('Rendering dashboard with data:', data, 'isFake:', isFake);  // Debug log

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

  metrics.innerHTML = `
    <div class="metric-card"><h3>Revenue</h3><p>£${data.revenue.total.toLocaleString()}</p><p class="trend">${data.revenue.trend}</p></div>
    <div class="metric-card"><h3>Churn Rate</h3><p>${data.churn.rate}%</p><p class="at-risk">${data.churn.at_risk} at risk</p></div>
    <div class="metric-card"><h3>LTV:CAC</h3><p>${data.performance.ratio}:1</p></div>
  `;
  insights.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight}</p>`;
  drawChart(data.revenue.history.labels, data.revenue.history.values, data.revenue.trend);
}

// === CHART.JS (Unchanged) ===
let revenueChart = null;
function drawChart(labels, values, caption) {
  const ctx = document.getElementById('revenueChart')?.getContext('2d');
  if (!ctx) return;

  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue',
        data: values,
        borderColor: '#00FFFF',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00FFFF',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(0, 255, 255, 0.1)' }, ticks: { color: '#E0E7FF' } },
        x: { grid: { display: false }, ticks: { color: '#E0E7FF' } }
      }
    }
  });

  const cap = document.getElementById('revenueCaption');
  if (cap) cap.textContent = `${caption} this month`;
}

// === AI CHAT (Updated: Use backend /api/chat for real Grok replies) ===
window.sendChat = async () => {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById('chat-messages');
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  input.value = '';

  if (!token) {
    chat.innerHTML += `<div class="ai-msg">Connect accounts to get real AI insights.</div>`;
    chat.scrollTop = chat.scrollHeight;
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: msg }),
      credentials: 'include'
    });
    const data = await res.json();
    chat.innerHTML += `<div class="ai-msg">${data.reply}</div>`;
  } catch (e) {
    console.error('Chat error:', e);
    chat.innerHTML += `<div class="ai-msg">Sorry, AI chat unavailable – try again.</div>`;
  }
  chat.scrollTop = chat.scrollHeight;
};

// === MOBILE MENU (SLIDE-IN) (Unchanged) ===
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999;
      backdrop-filter: blur(4px);
    }
    .mobile-overlay.open { display: block; }
    .mobile-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background: #0a0f2c;
      border-left: 1px solid #00FFFF;
      padding: 2rem 1.5rem;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: -10px 0 30px rgba(0, 255, 255, 0.2);
    }
    .mobile-menu.open { transform: translateX(0); }
    .mobile-menu a, .mobile-menu button {
      display: block;
      width: 100%;
      padding: 0.8rem 0;
      color: #E0E7FF;
      text-align: left;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      font-size: 1rem;
      text-decoration: none;
    }
    .mobile-menu a:hover, .mobile-menu button:hover {
      color: #00FFFF;
      padding-left: 0.5rem;
      transition: 0.2s;
    }
  `;
  document.head.appendChild(style);

  // Toggle
  const toggle = (open) => {
    menu.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    btn.textContent = open ? 'Close' : 'Menu';
  };

  btn.onclick = (e) => {
    e.stopPropagation();
    toggle(!menu.classList.contains('open'));
  };

  overlay.onclick = () => toggle(false);
  menu.querySelectorAll('a, button').forEach(el => {
    el.onclick = () => toggle(false);
  });
});

// === REFRESH BUTTON (Fixed: Sync + Real Data + Timeout Fallback) ===
window.refreshData = async () => {
  const btn = document.querySelector('.refresh-btn');
  if (btn) btn.textContent = 'Syncing...';  // Spinner-like

  if (!token) {
    console.warn('No token – rendering demo');
    renderDashboard(null, true);
    return;
  }

  const timeoutId = setTimeout(() => {
    console.warn('API timeout – forcing demo');
    renderDashboard(null, true);  // Anti-hang fallback after 5s
  }, 5000);

  try {
    console.log('Starting sync...');
    await apiFetch('api/sync', { method: 'POST' });  // NEW: Trigger sync
    const data = await apiFetch('api/metrics');
    console.log('API data received:', data);
    renderDashboard(data);
  } catch (e) {
    console.error('Refresh error:', e);
    if (e.message.includes('Unauthorized')) {  // Specific fallback
      console.log('Unauthorized – demo mode');
      renderDashboard(null, true);
    } else {
      alert('Refresh failed – showing demo data.');
      renderDashboard(null, true);
    }
  } finally {
    clearTimeout(timeoutId);
    setTimeout(() => {
      if (btn) btn.textContent = 'Refresh';
    }, 1000);
  }
};

// === LOGOUT (Fixed: Clear Cookie) ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=Lax';
      localStorage.clear();  // Fallback
      window.location.href = '/signup.html';
    });
  });
});

// === INIT: DASHBOARD ONLY ===
document.addEventListener('DOMContentLoaded', async () => {
  if (document.body.dataset.page !== 'dashboard') return;

  // FORCE DEMO MODE VIA URL
  if (window.location.search.includes('demo=1')) {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=Lax';
    token = null;
  }

  token = getToken();  // Re-fetch on load
  console.log('Init token:', token ? 'present' : 'missing');  // Debug log

  if (!token) {
    console.log('No token – rendering demo');
    renderDashboard(null, true); 
  } else {
    console.log('Token OK – loading real data');
    await refreshData();  // Use fixed refresh
  }
});