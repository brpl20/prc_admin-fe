const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,
  experimental: {
    // Enable SWC for faster builds
    forceSwcTransforms: true,
    // Reduce memory usage
    workerThreads: false,
    // Enable faster refresh
    optimizeCss: true,
  },

  compiler: {
    styledComponents: true,
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize webpack for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Enable faster incremental builds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Optimize chunk splitting for faster HMR
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Reduce bundle size in development
    productionBrowserSourceMaps: false,
  }),
};

module.exports = withBundleAnalyzer(nextConfig);