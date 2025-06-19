/* eslint-disable */
const path = require('path');

module.exports = {
  reactStrictMode: false,
  transpilePackages: ['@pcd/passport-interface'],
  experimental: {
    runtime: 'nodejs',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource: (resource, context) => {
          if (
            context.includes(path.resolve(__dirname, './carbonvote-contracts'))
          ) {
            return true;
          }
          return false;
        },
      })
    );

    config.resolve.fallback = {
      fs: false,
      path: false,
      stream: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.carbonvote.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'carbon-vote-git-feature-farcaster-refactor-carbonvote.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'carbon-vote-reno-ecfnetwork-carbonvote.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
