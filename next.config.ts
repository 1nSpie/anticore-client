import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use our backend for image optimization
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      // Development
      {
        protocol: "http",
        hostname: "localhost",
        port: "4444",
        pathname: "/static/**",
      },
      // Production domain
      {
        protocol: "https",
        hostname: "xn--80aaag6amsblus.xn--p1ai",
        pathname: "/api/static/**",
      },
      // Fallback for any API static routes
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/static/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
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
