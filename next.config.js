/** @type {import('next').NextConfig} */
const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['github.io'],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/CareerTrack-Pro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/CareerTrack-Pro/' : '',
  trailingSlash: true,
};

module.exports = nextConfig; 