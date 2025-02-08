/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const repoName = 'CareerTrack-Pro';

const nextConfig = {
  // This setting tells Next.js to produce a static build.
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProduction ? `/${repoName}` : '',
  assetPrefix: isProduction ? `/${repoName}/` : '',
  trailingSlash: true,
  // Add webpack configuration to handle CSS properly
  webpack: (config) => {
    if (isProduction) {
      config.output = {
        ...config.output,
        publicPath: `/${repoName}/`,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 