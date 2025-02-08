/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const repoName = 'careertrackpro';

const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProduction ? `/${repoName}` : '',
  assetPrefix: isProduction ? `/${repoName}` : '',
  trailingSlash: true,
};

module.exports = nextConfig; 