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
  // Add rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 