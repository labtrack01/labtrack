/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tremor/react'],
  },
};

module.exports = nextConfig; 