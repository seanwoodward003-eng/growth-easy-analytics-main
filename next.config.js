/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export / prerender (prevents cached 304 responses in embedded)
  output: 'standalone', // Recommended for Next.js on Vercel with dynamic routes
  trailingSlash: false,
  reactStrictMode: true,

  // Force dynamic rendering on all pages (no ISR/prerender)
  experimental: {
    serverComponentsExternalPackages: ['jose'], // for jwtVerify
  },

  // Optional: if you need images or other features
  images: {
    domains: ['cdn.shopify.com', '*.shopify.com', '*.stripe.com'],
  },
};

module.exports = nextConfig;