/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export since we need API routes
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/careertrackpro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/careertrackpro/' : '',
  // Configure body parser and response size
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  // Exclude canvas and other binary modules from being processed by webpack
  webpack: (config, { isServer }) => {
    // Add a rule to handle binary modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Exclude canvas from being processed by webpack
    config.externals.push({
      canvas: 'commonjs canvas',
      'canvas/build/Release/canvas.node': 'commonjs canvas/build/Release/canvas.node',
    });

    return config;
  },
};

module.exports = nextConfig; 