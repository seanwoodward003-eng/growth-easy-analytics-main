// script.js — FINAL LIVE VERSION (REAL DATA ONLY, MULTI-PLATFORM CONNECT)
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  // === ELEMENTS ===
  const metricsDiv = document.getElementById('dashboard-metrics');
  const insightsDiv = document.getElementById('ai-insights');
  const chatMessagesDiv = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.send-btn');
  const refreshBtn = document.querySelector('.refresh-btn');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  // === FETCH REAL DATA ===
  async function fetchData() {
    if (!token) return { error: "Please log in" };

    try {
      const res = await fetch('/api/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { error: "Failed to load data" };
    }
  }

  // === RENDER METRICS ===
  function renderMetrics(data) {
    if (data.error === "Connect Shopify first") {
      metricsDiv.innerHTML = `
        <div class="connect-prompt">
          <h3>Connect Your Accounts</h3>
          <p>Unlock real-time revenue, churn, and AI insights.</p>
          <button onclick="connectShopify()">Connect Shopify</button>
          <button onclick="connectHubSpot()">Connect HubSpot</button>
          <button onclick="connectGA4()">Connect Google Analytics</button>
        </div>
      `;
      return;
    }

    if (data.error) {
      metricsDiv.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    metricsDiv.innerHTML = `
      <div class="metrics-container">
        <div class="metric-card"><h3>Revenue</h3><p>£${data.revenue.total.toLocaleString()}</p><p class="trend">up ${data.revenue.trend}</p></div>
        <div class="metric-card"><h3>Churn Rate</h3><p>${data.churn.rate}%</p><p class="at-risk">${data.churn.at_risk} at risk</p></div>
        <div class="metric-card"><h3>Acquisition Cost</h3><p>£${data.ga4?.acquisition_cost || '--'}</p></div>
        <div class="metric-card"><h3>Top Channel</h3><p>${data.ga4?.top_channel || '--'}</p></div>
      </div>
    `;

    insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${data.ai_insight}</p>`;
  }

  // === CONNECT FUNCTIONS ===
  window.connectShopify = () => {
    const shop = prompt("Enter your Shopify store (e.g. my-store.myshopify.com):");
    if (shop) window.location.href = `/auth/shopify?shop=${shop}`;
  };

  window.connectHubSpot = () => {
    window.location.href = '/auth/hubspot';
  };

  window.connectGA4 = () => {
    window.location.href = '/auth/ga4';
  };

  // === LOAD DATA ===
  const data = await fetchData();
  renderMetrics(data);

  // === CHAT SYSTEM ===
  let messages = ['AI: Welcome! Ask me about churn, revenue, or growth.'];
  const updateChat = () => {
    chatMessagesDiv.innerHTML = messages.map(m => `<p>${m}</p>`).join('');
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  };
  updateChat();

  sendBtn.addEventListener('click', () => {
    const q = chatInput.value.trim();
    if (!q) return;
    messages.push(`You: ${q}`, 'AI: Thinking...');
    updateChat();
    chatInput.value = '';
    setTimeout(() => {
      messages[messages.length - 1] = `AI: Churn is ${data.churn?.rate || '--'}%. Send win-back emails to ${data.churn?.at_risk || 0} at-risk customers.`;
      updateChat();
    }, 800);
  });

  // === REFRESH ===
  refreshBtn?.addEventListener('click', () => location.reload());

  // === MOBILE MENU ===
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('open');
    menuBtn.textContent = mobileMenu.classList.contains('open') ? 'Close' : 'Menu';
  });

  document.addEventListener('click', (e) => {
    if (!menuBtn?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      mobileMenu?.classList.remove('open');
      if (menuBtn) menuBtn.textContent = 'Menu';
    }
  });

  mobileMenu?.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (menuBtn) menuBtn.textContent = 'Menu';
    });
  });
});