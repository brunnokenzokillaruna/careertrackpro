/** @type {import('next').NextConfig} */
const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/careertrackpro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/careertrackpro/' : '',
  trailingSlash: true,
  // Remove any custom rewrites or redirects for static export
};

module.exports = nextConfig; 