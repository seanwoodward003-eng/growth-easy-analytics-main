/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <-- add this line back
  trailingSlash: true,  // keep if you have it
};

module.exports = nextConfig;