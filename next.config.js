/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        // Match all .gif, .png, .jpg, .mp4 files
        source: "/:all*\\.(gif|png|jpg|mp4)$",
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
};

module.exports = nextConfig;
