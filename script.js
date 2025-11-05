// script.js — FINAL: METRICS + CHAT + MOBILE MENU
document.addEventListener('DOMContentLoaded', async () => {
  // === MOCK DATA (FALLBACK) ===
  const MOCK_DATA = {
    metrics: {
      revenue: { total: 12450, trend: "12%" },
      shopify: { churn_rate: 3.2, at_risk_customers: 18 },
      ga4: { acquisition_cost: 87, top_channel: "Organic" }
    },
    insights: { churn: "18 customers at risk. Send 'We Miss You' email with 20% off." }
  };

  // === FETCH REAL DATA OR USE MOCK ===
  async function fetchData() {
    try {
      const res = await fetch('https://growth-easy-analytics-2.onrender.com/metrics', {
        headers: {
          "X-API-Key": "8f3a9c2d1e5b7g4h6j9k0l2m3n4p5q6r",
          "user-id": "sean"
        }
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return MOCK_DATA.metrics;
    }
  }

  // === ELEMENTS ===
  const metricsDiv = document.getElementById('dashboard-metrics');
  const insightsDiv = document.getElementById('ai-insights');
  const chatMessagesDiv = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.send-btn');
  const refreshBtn = document.querySelector('.refresh-btn');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  // === LOAD METRICS ===
  const data = await fetchData();
  metricsDiv.innerHTML = `
    <div class="metrics-container">
      <div class="metric-card"><h3>Revenue</h3><p>£${data.revenue.total.toLocaleString()}</p><p class="trend">up ${data.revenue.trend}</p></div>
      <div class="metric-card"><h3>Churn Rate</h3><p>${data.shopify.churn_rate}%</p><p class="at-risk">${data.shopify.at_risk_customers} at risk</p></div>
      <div class="metric-card"><h3>Acquisition Cost</h3><p>£${data.ga4.acquisition_cost}</p></div>
      <div class="metric-card"><h3>Top Channel</h3><p>${data.ga4.top_channel}</p></div>
    </div>
  `;

  // === AI INSIGHT ===
  insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${MOCK_DATA.insights.churn}</p>`;

  // === CHAT SYSTEM ===
  let messages = ['AI: Welcome! 18 at risk. Send 20% off.'];
  if (!localStorage.getItem('welcome_shown')) {
    localStorage.setItem('welcome_shown', 'true');
  } else {
    messages = [];
  }

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
      messages[messages.length - 1] = `AI: Churn is 3.2%. Send email now.`;
      updateChat();
    }, 800);
  });

  // === REFRESH BUTTON ===
  refreshBtn?.addEventListener('click', () => location.reload());

  // === MOBILE MENU TOGGLE ===
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('open');
    menuBtn.textContent = mobileMenu.classList.contains('open') ? 'Close' : 'Menu';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      mobileMenu?.classList.remove('open');
      if (menuBtn) menuBtn.textContent = 'Menu';
    }
  });

  // Close menu on link click
  mobileMenu?.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (menuBtn) menuBtn.textContent = 'Menu';
    });
  });
});
