/**
 * HTTP-клиент личного кабинета: Bearer access + httpOnly refresh-кука.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";
export const CABINET_API_BASE = rawBase.replace(/\/$/, "");

export const CABINET_TOKEN_KEY = "cabinet_access_token";

const CABINET_LOGIN_PATH = "/cabinet/login";

const GUEST_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-registration",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

export const cabinetAxios = axios.create({
  baseURL: CABINET_API_BASE,
  withCredentials: true,
  timeout: 20000,
});

cabinetAxios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem(CABINET_TOKEN_KEY);
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
  }
  return config;
});

function isGuestAuthRequest(url?: string): boolean {
  if (!url) return false;
  return GUEST_AUTH_PATHS.some((path) => url.includes(path));
}

function shouldRedirectToLogin(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return (
    path.startsWith("/cabinet") &&
    path !== CABINET_LOGIN_PATH &&
    !path.startsWith("/cabinet/register") &&
    !path.startsWith("/cabinet/forgot-password")
  );
}

/** Сброс сессии и редирект на форму входа (при 401 в защищённых разделах). */
export function endCabinetSession(options?: { redirect?: boolean }) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CABINET_TOKEN_KEY);
  const redirect = options?.redirect ?? shouldRedirectToLogin();
  if (redirect) {
    window.location.replace(CABINET_LOGIN_PATH);
  }
}

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post<{
    accessToken: string;
  }>(
    `${CABINET_API_BASE}/auth/refresh`,
    {},
    { withCredentials: true, timeout: 15000 },
  );
  if (typeof window !== "undefined" && data.accessToken) {
    localStorage.setItem(CABINET_TOKEN_KEY, data.accessToken);
  }
  return data.accessToken;
}

cabinetAxios.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as InternalAxiosRequestConfig & {
      _cabinetRetry?: boolean;
    };
    const url = original?.url ?? "";

    if (status !== 401) {
      return Promise.reject(error);
    }

    // Неверный пароль и т.п. на гостевых формах — не сбрасываем сессию.
    if (isGuestAuthRequest(url)) {
      return Promise.reject(error);
    }

    if (original && !original._cabinetRetry && !url.includes("/auth/refresh")) {
      original._cabinetRetry = true;
      try {
        await refreshAccessToken();
        return cabinetAxios(original);
      } catch {
        endCabinetSession();
        return Promise.reject(error);
      }
    }

    endCabinetSession();
    return Promise.reject(error);
  },
);

export function setCabinetAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(CABINET_TOKEN_KEY, token);
  else localStorage.removeItem(CABINET_TOKEN_KEY);
}

export async function cabinetLogout() {
  try {
    await cabinetAxios.post("/auth/logout");
  } catch {
    /* ignore */
  }
  setCabinetAccessToken(null);
}
