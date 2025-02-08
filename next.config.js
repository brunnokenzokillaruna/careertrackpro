/** @type {import('next').NextConfig} */
const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
  },
  ...(process.env.NODE_ENV === 'production' ? {
    basePath: '/CareerTrack-Pro',
    assetPrefix: '/CareerTrack-Pro/',
    trailingSlash: true,
  } : {})
};

module.exports = nextConfig; 