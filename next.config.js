/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' — we need server API routes (correct, keep this commented or absent)
  
  async headers() {
    return [
      {
        source: '/:path*',  // Applies to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://admin.shopify.com https://*.shopify.com; " +
                   "default-src 'self' https://cdn.shopify.com https://*.shopify.com 'unsafe-inline' 'unsafe-eval'; " +
                   "script-src 'self' https://cdn.shopify.com https://*.shopify.com 'unsafe-inline' 'unsafe-eval'; " +
                   "style-src 'self' 'unsafe-inline'; " +
                   "img-src 'self' https://cdn.shopify.com https://*.shopify.com data:; " +
                   "connect-src 'self' https://*.shopify.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;