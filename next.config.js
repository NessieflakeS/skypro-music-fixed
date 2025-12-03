/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/img/**',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
