import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4444",
        pathname: "/static/images/**",
      },
      {
        protocol: 'https',
        hostname: 'xn--80aaag6amsblus.xn--p1ai',
        port: '',
        pathname: '/static/images/**',
      },
      {
        protocol: 'https',
        hostname: "93aa0dbd-5fad-472e-80c1-bb169b44d09c.selstorage.ru"
      }
    ],
  },
  env: {
    API_URL: "/api",
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Улучшаем стабильность при пересборке
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://xn--80aaag6amsblus.xn--p1ai",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:4444",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT" },
        ],
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/glav",
        destination: "/",
        permanent: true,
      },
    ];
  },
  // Логирование ошибок только в development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
