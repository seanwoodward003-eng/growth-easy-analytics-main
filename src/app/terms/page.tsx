// app/terms/page.tsx
export default function TermsOfService() {
  return (
    <div className="min-h-screen px-6 py-20 md:px-12 lg:px-24 bg-gradient-to-br from-[#0a0f2c] to-black">
      <div className="max-w-5xl mx-auto text-cyan-100 space-y-10">
        <h1 className="text-6xl md:text-8xl font-black text-cyan-400 text-center mb-16 glow-title">
          Terms of Service
        </h1>

        <p className="text-lg md:text-xl leading-relaxed">
          Last updated: December 30, 2025
        </p>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">1. Acceptance of Terms</h2>
          <p>
            By accessing or using GrowthEasy AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">2. Description of Service</h2>
          <p>
            GrowthEasy AI provides AI-powered analytics and insights for Shopify stores using data from connected platforms (Shopify, GA4, HubSpot). We do not modify your store data — only read and analyze.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">3. Subscriptions & Payments</h2>
          <p>
            Paid plans are billed via Stripe. Lifetime plans are one-time payments. Subscriptions auto-renew unless canceled. No refunds after 7 days except as required by law.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">4. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account and connected platforms. You grant GrowthEasy AI permission to access your data for analytics purposes only.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">5. Limitation of Liability</h2>
          <p>
            The Service is provided "as is". We are not liable for any loss of revenue or data from use of the Service. Insights are AI-generated and not financial advice.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">6. Changes to Terms</h2>
          <p>
            We may update these terms. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-cyan-300">7. Contact</h2>
          <p>
            Questions? Email support@growtheasy.ai
          </p>
        </section>

        <p className="text-center text-cyan-400 text-2xl mt-20">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </div>
    </div>
  );
}