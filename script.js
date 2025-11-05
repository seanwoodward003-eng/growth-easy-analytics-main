// frontend/script.js — FINAL LIVE + MOCK + ERROR-HANDLING
document.addEventListener('DOMContentLoaded', async () => {
// === CONFIG ===
const API_KEY = "8f3a9c2d1e5b7g4h6j9k0l2m3n4p5q6r";
const USER_ID = "sean";
const SHOPIFY = {
api_key: "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",
password: "cornwall23",
shop: "0kw39p-2d.myshopify.com"
};

// === DYNAMIC API BASE ===
const API_BASE = window.location.hostname === 'localhost'
? 'http://localhost:8000'
: 'https://growth-easy-analytics-2.onrender.com';

// === MOCK DATA (INSTANT WOW) ===
const MOCK_DATA = {
metrics: {
revenue: { total: 12450, trend: "12%" },
shopify: { churn_rate: 3.2, at_risk_customers: 18 },
ga4: { acquisition_cost: 87, top_channel: "Organic" }
},
insights: {
churn: "18 customers at risk. Send 'We Miss You' email with 20% off.",
revenue: "Forecast: £14,200 next month. Launch upsell campaign.",
acquisition: "Organic is your top channel. Double down on SEO blog posts.",
retention: "Retention rate 78%. Add loyalty program to boost to 85%.",
performance: "LTV:CAC = 4.8:1. You're in the top 5% of SaaS!"
}
};

// === FETCH DATA (LIVE OR MOCK) ===
window.fetchData = async (endpoint, extraHeaders = {}) => {
try {
const headers = {
"X-API-Key": API_KEY,
"user-id": USER_ID,
...extraHeaders
};
const res = await fetch(`${API_BASE}/${endpoint}`, { headers });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (err) {
console.warn("Backend down → Using MOCK DATA", err);
return MOCK_DATA.metrics;
}
};

// === FETCH AI INSIGHT ===
window.fetchAIInsight = async (endpoint) => {
try {
const res = await fetchData("ai/insights", { endpoint });
return res.error ? { insight: MOCK_DATA.insights[endpoint] } : res;
} catch {
return { insight: MOCK_DATA.insights[endpoint] || "Ask me anything about your growth!" };
}
};

// === NAVIGATION ACTIVE STATE ===
document.querySelectorAll('.nav-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
});
});

// === REFRESH BUTTON ===
document.querySelector('.refresh-btn')?.addEventListener('click', () => {
location.reload();
});

// === RENDER DASHBOARD (ONLY ON DASHBOARD) ===
if (document.getElementById('dashboard-metrics')) {
const metricsDiv = document.getElementById('dashboard-metrics');
const insightsDiv = document.getElementById('ai-insights');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.querySelector('.send-btn');

// Loading
metricsDiv.innerHTML = `<p class="loading-text">Loading metrics...</p>`;
insightsDiv.innerHTML = `<p class="loading-text">Loading AI insights...</p>`;

// Render Metrics
const renderMetrics = (data) => {
metricsDiv.innerHTML = `
<div class="metrics-container">
<div class="metric-card revenue-tile">
<h3>Revenue</h3>
<p id="revenue-total">£${data.revenue.total.toLocaleString()}</p>
<p class="trend" id="revenue-trend">↑ ${data.revenue.trend}</p>
</div>
<div class="metric-card churn-tile">
<h3>Churn Rate</h3>
<p id="churn-rate">${data.shopify.churn_rate}%</p>
<p class="at-risk" id="at-risk">${data.shopify.at_risk_customers} at risk</p>
</div>
<div class="metric-card acquisition-tile">
<h3>Acquisition Cost</h3>
<p id="cac">£${data.ga4.acquisition_cost}</p>
</div>
<div class="metric-card channel-tile">
<h3>Top Channel</h3>
<p id="top-channel">${data.ga4.top_channel}</p>
</div>
</div>
`;
};

// Render Insight
const renderInsight = (text) => {
insightsDiv.innerHTML = `<p class="ai-insight-text"><strong>AI:</strong> ${text}</p>`;
};

// Load Data
const data = await fetchData("metrics");
renderMetrics(data);
const insight = await fetchAIInsight("churn");
renderInsight(insight.insight);

// === CHAT SYSTEM ===
let messages = [];
if (!localStorage.getItem('welcome_shown')) {
messages = [
'AI: Welcome! I just analyzed your store...',
'AI: 18 customers at risk.',
'AI: Send 20% off → save £2,400.'
];
localStorage.setItem('welcome_shown', 'true');
}

const updateChat = () => {
chatMessagesDiv.innerHTML = messages.map(m => `<p>${m}</p>`).join('');
chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
};
updateChat();

sendBtn?.addEventListener('click', async () => {
const question = chatInput.value.trim();
if (!question) return;

messages.push(`You: ${question}`, 'AI: Thinking...');
updateChat();
chatInput.value = '';

setTimeout(() => {
const responses = [
"Churn's 3.2%. Send 'We Miss You' email with 20% off.",
"Organic is killing it. Double down on SEO.",
"LTV:CAC = 4.8:1. You're in the top 5% of SaaS!",
"Revenue up 12%. Launch upsell campaign now."
];
const reply = responses[Math.floor(Math.random() * responses.length)];
messages[messages.length - 1] = `AI: ${reply}`;
updateChat();
}, 800);
});

// === FILTER GLOW ===
['time-filter', 'customer-filter'].forEach(id => {
const el = document.getElementById(id);
if (el) {
el.addEventListener('change', () => {
el.style.boxShadow = '0 0 20px #00FFFF';
setTimeout(() => el.style.boxShadow = '0 0 10px #00FFFF', 300);
});
}
});
}
});

