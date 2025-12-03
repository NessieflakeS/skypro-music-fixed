/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/img/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  turbopack: {},
  experimental: {
    turbo: {
    }
  }
};

module.exports = nextConfig;