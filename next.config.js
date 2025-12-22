/** @type {import('next').NextConfig} */
const nextConfig = {
  /* output: 'export',  // This creates the 'out/' folder with static HTML/JS/CSS */
  trailingSlash: true,  // Helps with routing
  images: { unoptimized: true }  // Required for static export
};

module.exports = nextConfig;