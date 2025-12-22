/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <-- this line enables static export
  // Optional: for clean URLs ( /dashboard instead of /dashboard.html )
  trailingSlash: true,
};

module.exports = nextConfig;