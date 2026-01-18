export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-6xl md:text-8xl font-black mb-16">
        Privacy Policy
      </h1>

      <div className="max-w-5xl mx-auto space-y-10 text-lg md:text-xl leading-relaxed text-cyan-100">
        <p className="text-sm text-cyan-400 text-center mb-8">Last updated: 18 January 2026</p>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">1. Introduction</h2>
          <p>
            GrowthEasy AI ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform, including when you connect your Shopify, Google Analytics 4, or HubSpot accounts. We comply with the UK GDPR and EU GDPR where applicable.
          </p>
          <p className="mt-6">
            This service is for business use only – not for consumers under 18 or personal use. The Consumer Rights Act 2015 does not apply.
          </p>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">2. Data We Collect</h2>
          <p>
            We collect only the minimum data necessary to provide our service:
          </p>
          <ul className="list-disc pl-8 space-y-4 mt-4">
            <li>Your email address (for account creation and communication)</li>
            <li>OAuth access tokens for Shopify, GA4, and HubSpot (securely stored, used only to fetch analytics data)</li>
            <li>Aggregated analytics data (revenue, orders, traffic, contacts) — never individual customer PII unless explicitly provided by connected platforms</li>
            <li>Usage data (which pages you visit, features used) for product improvement</li>
          </ul>
          <p className="mt-6">
            We do <strong>not</strong> collect payment details — all billing is handled securely by Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">3. How We Use Your Data</h2>
          <p>
            Your data is used solely to:
          </p>
          <ul className="list-disc pl-8 space-y-4 mt-4">
            <li>Provide real-time analytics and AI-powered growth insights</li>
            <li>Generate personalised recommendations via the AI Growth Coach</li>
            <li>Improve our product and fix bugs</li>
            <li>Send occasional service updates (you can opt out)</li>
          </ul>
          <p className="mt-6">
            We process your data under legitimate interest for service delivery (scans, insights, weekly emails) and relevant marketing (product updates). This is necessary and proportionate, with low privacy impact. You can object anytime by emailing privacy@growtheasy-ai.com.
          </p>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">4. Data Storage & Security</h2>
          <p>
            All data is encrypted at rest and in transit. Access tokens are stored securely and never logged. We use industry-standard providers (Render, Vercel, Stripe) with GDPR-compliant infrastructure. Data is retained only as long as your account is active. Upon deletion, all data is permanently removed within 30 days.
          </p>

          <p className="mt-6">
            We use encryption, access controls, rate limiting, and regular testing to secure data.
          </p>

          <p className="mt-6">
            <strong>In the unlikely event of a data breach, we will notify affected users and the ICO as required by law.</strong>
          </p>

          <p className="mt-6">
            We use US-based processors (Resend, Stripe, OpenAI) with Standard Contractual Clauses (SCCs) or UK International Data Transfer Agreement (IDTA) for international transfers.
          </p>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">5. Your Rights (GDPR)</h2>
          <p>
            You have the right to access, rectify, erase, object to, or port your data. Email info@growtheasy-ai.com for any request — we respond within 1 month.
          </p>
          <ul className="list-disc pl-8 space-y-4 mt-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion ("right to be forgotten")</li>
            <li>Object to processing</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-6">
            Contact us at info@growtheasy-ai.com (or privacy@growtheasy-ai.com) to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-cyan-400 glow-medium mb-6">6. Contact</h2>
          <p>
            For privacy questions or data requests:<br />
            info@growtheasy-ai.com or privacy@growtheasy-ai.com<br />
            GrowthEasy AI<br />
            51 Portal Road<br />
            Winchester<br />
            SO23 0PU<br />
            United Kingdom
          </p>
        </section>
      </div>

      <div className="text-center mt-20">
        <p className="text-2xl text-cyan-400 glow-medium">
          Beta v0.1 © 2026 GrowthEasy AI
        </p>
      </div>
    </div>
  );
}