const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations for Next.js 15
  turbopack: {
    rules: {},
  },

  compiler: {
    styledComponents: true,
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize webpack for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable faster incremental builds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Reduce memory usage and optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all',
            priority: 20,
          },
          emotion: {
            test: /[\\/]node_modules[\\/]@emotion[\\/]/,
            name: 'emotion', 
            chunks: 'all',
            priority: 20,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
          },
        },
      };

      // Additional development optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize common imports
        '@mui/material': '@mui/material',
        '@emotion/react': '@emotion/react',
      };
    }

    return config;
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Additional performance settings
  poweredByHeader: false,
  compress: true,
};

module.exports = withBundleAnalyzer(nextConfig);
