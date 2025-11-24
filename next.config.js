const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Match all .gif, .png, .jpg, .mp4 files
        source: "/:all*\\.(gif|png|jpg|mp4|ttf)$",
        headers: [
          {
            key: "Cache-Control",
            // Cache for 1 year, immutable for versioned assets
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['react-konva', 'konva', 'motion'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
