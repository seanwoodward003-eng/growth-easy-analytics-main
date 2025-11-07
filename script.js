// static/script.js — FINAL: CONNECTS TO BACKEND + GROK AI
let token = localStorage.getItem('token');

function requireAuth() {
  if (!token) {
    window.location.href = '/signup.html';
    return false;
  }
  return true;
}

// FETCH REAL METRICS FROM BACKEND
async function fetchMetrics() {
  if (!token) return { error: "No token" };
  try {
    const res = await fetch('/api/metrics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (err) {
    console.error("Metrics error:", err);
    return { error: "Backend offline" };
  }
}

// AUTH & CONNECT BUTTONS
window.connectShopify = () => {
  const shop = prompt("Enter your Shopify store (e.g. mystore.myshopify.com)");
  if (shop) window.location.href = `/auth/shopify?shop=${encodeURIComponent(shop)}`;
};
window.connectHubSpot = () => window.location.href = '/auth/hubspot';
window.connectGA4 = () => window.location.href = '/auth/ga4';
window.logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/signup.html';
};
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
  style.textContent = `
    .mobile-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:999;}
    .mobile-overlay.open{display:block;}
    .mobile-menu{transform:translateY(-100%);transition:transform 0.3s ease;}
    .mobile-menu.open{transform:translateY(0);}
  `;
  document.head.appendChild(style);

  menuBtn.addEventListener('click', (e) => {
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

  // AI CHAT — POWERED BY GROK (YOU)
  const sendBtn = document.getElementById('send-btn');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  if (sendBtn && input && messages) {
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q) return;

    // User message
    messages.innerHTML += `
      <p style="background:#00FFFF;color:#0a0f2c;margin-left:auto;max-width:85%;padding:0.6rem 1rem;border-radius:12px;margin:0.5rem 0;word-wrap:break-word;">
        ${q}
      </p>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Send to backend → Grok
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: q })
      });
      const data = await res.json();
      const reply = data.reply || "AI is thinking...";

      messages.innerHTML += `
        <p style="background:rgba(255,255,255,0.1);max-width:85%;padding:0.6rem 1rem;border-radius:12px;margin:0.5rem 0;word-wrap:break-word;">
          ${reply}
        </p>`;
      messages.scrollTop = messages.scrollHeight;
    } catch (err) {
      messages.innerHTML += `
        <p style="color:#e74c3c;">AI offline. Try again.</p>`;
      messages.scrollTop = messages.scrollHeight;
    }
  }
});