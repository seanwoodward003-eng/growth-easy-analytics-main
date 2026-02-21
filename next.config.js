/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export / prerender where possible (helps embedded dynamic behavior)
  output: 'standalone', // Recommended for Next.js on Vercel with dynamic routes
  trailingSlash: false,
  reactStrictMode: true,

  // Force dynamic rendering on all pages (no ISR/prerender) – experimental
  experimental: {
    serverComponentsExternalPackages: ['jose'], // for jwtVerify
  },

  // Optional: if you need images or other features
  images: {
    domains: ['cdn.shopify.com', '*.shopify.com', '*.stripe.com'],
  },

  // IMPORTANT: Do NOT add static CSP headers here!
  // CSP must be dynamic (via middleware) for embedded Shopify apps
  // No headers: [] block needed unless you have other static ones
};

module.exports = nextConfig;