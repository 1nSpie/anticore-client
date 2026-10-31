import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker: самодостаточная сборка в .next/standalone (без полного node_modules в образе)
  output: "standalone",
  images: {
    // Все картинки — из Selectel S3 (NEXT_PUBLIC_S3_URL). Сменился домен бакета — обновить hostname.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "93aa0dbd-5fad-472e-80c1-bb169b44d09c.selstorage.ru",
      },
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
  // CORS для бэкенда настраивается на Nest (порт 4444), не дублируем здесь —
  // два блока с одним source давали бы конфликтующие заголовки.
  async redirects() {
    return [
      { source: "/crm", destination: "/admin/calendar", permanent: false },
      { source: "/crm/:path*", destination: "/admin/calendar", permanent: false },
      { source: "/admin/cabinet", destination: "/admin/clients", permanent: false },
      { source: "/admin/crm", destination: "/admin/calendar", permanent: false },
      {
        source: "/admin/crm/clients/:path*",
        destination: "/admin/clients/:path*",
        permanent: false,
      },
      { source: "/admin/crm/settings", destination: "/admin/sms", permanent: false },
      { source: "/admin/crm/:path*", destination: "/admin/calendar", permanent: false },
      // Кабинет мастера переехал в админку (единый вход): старые ссылки, закладки и установленное PWA продолжают работать
      { source: "/staff/login", destination: "/admin", permanent: false },
      { source: "/staff", destination: "/admin/master", permanent: false },
      { source: "/staff/:path*", destination: "/admin/master/:path*", permanent: false },
      { source: "/glav", destination: "/", permanent: true },
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
