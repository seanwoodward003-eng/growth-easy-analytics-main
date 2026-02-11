/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,  // Disable SWC minifier to avoid JSX parsing bugs in webpack builds
};

module.exports = nextConfig;