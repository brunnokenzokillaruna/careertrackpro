/** @type {import('next').NextConfig} */
const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/CareerTrack-Pro',
  assetPrefix: '/CareerTrack-Pro',
};

module.exports = nextConfig; 