/** @type {import('next').NextConfig} */
const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['github.io'],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/careertrackpro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/careertrackpro/' : '',
  trailingSlash: true,
};

module.exports = nextConfig; 