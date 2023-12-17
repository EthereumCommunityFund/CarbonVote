const path = require('path');

module.exports = {
  reactStrictMode: false,
  transpilePackages: ["@pcd/passport-interface"],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource: (resource, context) => {
          if (context.includes(path.resolve(__dirname, './carbonvote-contracts'))) {
            return true; 
          }
          return false; 
        },
      })
    );

    config.resolve.fallback = { fs: false };

    return config;
  },
};
