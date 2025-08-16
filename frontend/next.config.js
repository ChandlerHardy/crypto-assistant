/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack fallback for when not using Turbopack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        module: false,
        v8: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;