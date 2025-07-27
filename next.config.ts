import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "**",
      },
      {
        protocol: 'https',
        hostname: 'xn--80aaag6amsblus.xn--p1ai', // 👈 Punycode
        port: '',
        pathname: '/api/static/images/**',
      },
    ],
  },
  env: {
    API_URL: "/api",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*", // Внутренние API-роуты
      },
    ];
  },
  // Если используются внешние API
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://xn--80aaag6amsblus.xn--p1ai",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/", // Исходный путь
        destination: "/glav", // Путь, куда нужно перенаправить
        permanent: true, // `true` для постоянного редиректа (HTTP 308), `false` для временного (HTTP 307)
      },
    ];
  },
};

export default nextConfig;
