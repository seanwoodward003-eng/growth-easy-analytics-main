/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export / prerender for embedded routes
  output: 'standalone', // or remove if you had 'export'
  trailingSlash: false,
  reactStrictMode: true,

  // Force dynamic rendering on root and dashboard (no prerender)
  experimental: {
    serverComponentsExternalPackages: ['jose'], // if needed
  },
};

module.exports = nextConfig;