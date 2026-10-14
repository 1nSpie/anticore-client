import axios from "axios";
import { API_BASE_URL } from "@/app/admin/_lib/constants";

const TOKEN_KEY = "staff_auth_token";
const COOKIE = "staff_token";
const MAX_AGE_SEC = 30 * 24 * 60 * 60; // D3: сессия 30 дней

export interface StaffUser {
  id: number;
  login: string;
  fullName: string;
  role: "ADMIN" | "MASTER";
  locations: string[];
}

export const staffApi = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

staffApi.interceptors.request.use((config) => {
  const token = getStaffToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

staffApi.interceptors.response.use(
  (r) => r,
  (error) => {
    // Токен отозван/заблокирован/истёк — сбрасываем сессию и уходим на вход
    if (error.response?.status === 401 && !String(error.config?.url).includes("/staff/auth/login")) {
      clearStaffSession();
      if (typeof window !== "undefined") window.location.replace("/staff/login");
    }
    // Регламент обновили: все разделы кабинета закрыты, пока мастер не ознакомится (D17)
    if (error.response?.status === 403 && error.response?.data?.code === "REGULATION_ACK_REQUIRED") {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/staff/regulation")) {
        window.location.replace("/staff/regulation");
      }
    }
    return Promise.reject(error);
  },
);

export function getStaffToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveStaffSession(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearStaffSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
