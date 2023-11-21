module.exports = {
  reactStrictMode: false,
  transpilePackages: ["@pcd/passport-interface"],
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
};
