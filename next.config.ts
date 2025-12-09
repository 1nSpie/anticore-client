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
    ],
  },
  env: {
    API_URL: "/api",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
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
        source: "/glav",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
