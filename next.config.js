/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ['jose'],
  },

  images: {
    domains: ['cdn.shopify.com', '*.shopify.com', '*.stripe.com'],
  },

  // Force Shopify-safe CSP on ALL routes (overrides any defaults/caches)
  async headers() {
    return [
      {
        source: '/:path*',  // Applies to everything, including root /
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://admin.shopify.com https://*.shopify.com https://*.myshopify.com; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com https://js.stripe.com https://*.stripe.com; connect-src 'self' https://*.shopify.com https://*.myshopify.com https://api.stripe.com https://checkout.stripe.com https://*.stripe.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; img-src 'self' data: blob: https://cdn.shopify.com https://*.shopify.com https://*.stripe.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self';"
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;