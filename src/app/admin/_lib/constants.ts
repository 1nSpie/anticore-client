// Константы для админ-панели

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";

export const AUTH_TOKEN_KEY = "admin_auth_token";

export const ADMIN_API_TIMEOUT = 10000;
