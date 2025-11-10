// static/script.js — FINAL: FULLY OPTIMIZED, REAL BACKEND SYNC (NO 404s, CLEAN, MODULAR)
const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';  // Your backend (Render)
let token = localStorage.getItem('token');

// === AUTH & UTILITIES ===
function requireAuth() {
  if (!token) {
    window.location.href = '/signup.html';
    return false;
  }
  return true;
}

function setAuthToken(t) {
  token = t;
  localStorage.setItem('token', t);
}

function clearAuth() {
  localStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

async function apiFetch(endpoint, options = {}) {
  if (!token) return { error: 'No token' };

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const config = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };

  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, config);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { error: err.message || 'Network error' };
  }
}

// === OAUTH & USER ACTIONS ===
window.connectShopify = () => {
  const shop = prompt("Enter your Shopify store (e.g. mystore.myshopify.com)");
  if (shop?.trim()) {
    window.location.href = `${BACKEND_URL}/auth/shopify?shop=${encodeURIComponent(shop.trim())}`;
  }
};

window.connectHubSpot = () => window.location.href = `${BACKEND_URL}/auth/hubspot`;
window.connectGA4 = () => window.location.href = `${BACKEND_URL}/auth/ga4`;

window.logout = () => {
  clearAuth();
  window.location.href = '/signup.html';
};

window.refreshData = () => location.reload();

window.profile = async () => {
  if (!requireAuth()) return;
  const data = await apiFetch('/api/user');
  if (data.error) {
    alert('Failed to load profile: ' + data.error);
    return;
  }
  const shopify = data.shopify_shop ? 'Yes' : 'No';
  const ga4 = data.ga4_connected ? 'Yes' : 'No';
  const hubspot = data.hubspot_connected ? 'Yes' : 'No';
  alert(`Profile:\nID: ${data.id}\nEmail: ${data.email}\nShopify: ${shopify}\nGA4: ${ga4}\nHubSpot: ${hubspot}`);
};

// === MOBILE MENU (CLEAN, REUSABLE, NO DUPLICATE STYLES) ===
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  // Create overlay once
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }

  // Inject styles only once
  if (!document.getElementById('mobile-menu-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-menu-styles';
    style.textContent = `
      .mobile-overlay { 
        display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
        background: rgba(0,0,0,0.7); z-index: 999; 
      }
      .mobile-overlay.open { display: block; }
      .mobile-menu { 
        transform: translateX(100%); transition: transform 0.3s ease; 
        position: fixed; top: 0; right: 0; width: 280px; height: 100vh; 
        background: var(--card, #1a1a2e); padding: 2rem; z-index: 1000; 
        box-shadow: -4px 0 20px rgba(0,0,0,0.3);
      }
      .mobile-menu.open { transform: translateX(0); }
      .mobile-menu-btn { cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  const toggleMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  };

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!mobileMenu.classList.contains('open'));
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  // Close on link/button click
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => toggleMenu(false));
  });
});

// === AI CHAT (REAL-TIME, CLEAN UI, ERROR HANDLING) ===
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('send-btn');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  if (!sendBtn || !input || !messages) return;

  const appendMessage = (text, isUser = false) => {
    const bubble = document.createElement('p');
    bubble.style.cssText = `
      max-width: 85%; padding: 0.6rem 1rem; border-radius: 12px; 
      margin: 0.5rem 0; word-wrap: break-word; font-size: 0.95rem;
      ${isUser 
        ? 'background: #00FFFF; color: #0a0f2c; margin-left: auto;' 
        : 'background: rgba(255,255,255,0.1); color: #eee;'
      }
    `;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  };

  const sendMessage = async () => {
    const q = input.value.trim();
    if (!q) return;

    appendMessage(q, true);
    input.value = '';
    appendMessage('Thinking...');

    const data = await apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: q })
    });

    // Remove "Thinking..."
    messages.removeChild(messages.lastChild);

    if (data.error) {
      appendMessage(`Error: ${data.error}`, false);
    } else {
      appendMessage(data.reply || "No response from AI.", false);
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage()));
});

// === DASHBOARD & PAGE LOADERS ===
async function fetchMetrics() {
  return await apiFetch('/api/metrics');
}

function renderFakeMetrics(container, insightContainer) {
  container.innerHTML = `
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
  insightContainer.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> Demo mode — connect accounts for real data.</p>`;
}

function renderRealMetrics(data, container, insightContainer) {
  container.innerHTML = `
    <div class="metric-card">
      <h3>Revenue</h3>
      <p>£${data.revenue?.total ?? 0}</p>
      <p class="trend">${data.revenue?.trend ?? '0%'}</p>
    </div>
    <div class="metric-card">
      <h3>Churn Rate</h3>
      <p>${data.churn?.rate ?? 0}%</p>
      <p class="at-risk">${data.churn?.at_risk ?? 0} at risk</p>
    </div>
    <div class="metric-card">
      <h3>LTV:CAC</h3>
      <p>${data.performance?.ratio ?? '--'}:1</p>
    </div>
  `;
  insightContainer.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight || 'Analyzing your data...'}</p>`;
}

async function loadPage(pageId, renderer) {
  if (!requireAuth()) return;
  const data = await fetchMetrics();
  const container = document.getElementById(pageId);
  if (!container) return;

  if (data.error || !data.revenue || data.revenue.total === 0) {
    renderer(container, data, true); // fake mode
  } else {
    renderer(container, data, false);
  }
}

// Page-specific renderers
const renderers = {
  dashboard: (container, data, isFake) => {
    const metrics = document.getElementById('dashboard-metrics');
    const insights = document.getElementById('ai-insights');
    if (!metrics || !insights) return;
    isFake ? renderFakeMetrics(metrics, insights) : renderRealMetrics(data, metrics, insights);
  },
  churn: (container, data) => {
    document.getElementById('churn-rate').textContent = `${data.churn?.rate ?? 0}%`;
    document.getElementById('at-risk').textContent = data.churn?.at_risk ?? 0;
    document.getElementById('ai-insight').textContent = data.ai_insight || "No insights yet.";
  },
  revenue: (container, data) => {
    document.getElementById('revenue-total').textContent = `£${data.revenue?.total ?? 0}`;
    document.getElementById('revenue-trend').textContent = data.revenue?.trend ?? '0%';
    document.getElementById('ai-insight').textContent = data.ai_insight || "No insights yet.";
  },
  acquisition: (container, data) => {
    document.getElementById('acquisition-cost').textContent = `£${data.acquisition?.cost ?? 87}`;
    document.getElementById('top-channel').textContent = data.acquisition?.top_channel || 'Organic';
    document.getElementById('ai-insight').textContent = data.ai_insight || "Focus on organic for ROI.";
  },
  retention: (container, data) => {
    document.getElementById('retention-rate').textContent = `${data.retention?.rate ?? 85}%`;
    document.getElementById('at-risk').textContent = data.retention?.at_risk ?? 10;
    document.getElementById('ai-insight').textContent = data.ai_insight || "Send re-engagement email to 10 at-risk.";
  },
  performance: (container, data) => {
    document.getElementById('ltv').textContent = `£${data.performance?.ltv ?? 150}`;
    document.getElementById('cac').textContent = `£${data.performance?.cac ?? 50}`;
    document.getElementById('ratio').textContent = `${data.performance?.ratio ?? '3'}:1`;
    document.getElementById('ai-insight').textContent = data.ai_insight || "Healthy LTV:CAC—keep scaling.";
  }
};

// === ROUTER ===
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const path = window.location.pathname;
  const pageMap = {
    '/': 'dashboard',
    '/churn.html': 'churn',
    '/revenue.html': 'revenue',
    '/acquisition.html': 'acquisition',
    '/retention.html': 'retention',
    '/performance.html': 'performance'
  };

  const page = pageMap[path];
  if (page && renderers[page]) {
    await loadPage(page, renderers[page]);
  }
});