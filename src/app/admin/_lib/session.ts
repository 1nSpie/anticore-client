// Единая сессия админки: один вход, роль определяет раздел.
// Администратор получает токен админки (`admin_auth_token`, API `/crm/*`), мастер — токен кабинета (`staff_auth_token`, API `/staff/*`).
// Какой токен лежит в браузере, решает сервер при входе; здесь только хранение и маршрутизация по роли.

import axios, { AxiosError } from "axios";
import { MASTER_HOME, clearStaffSession, getStaffToken, saveStaffSession } from "../master/_lib/staffSession";
import { updateApiToken } from "./api";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "./constants";

export type SessionRole = "ADMIN" | "MASTER";

export const ADMIN_HOME = "/admin/calendar";
// Корень кабинета мастера — одна константа в `master/_lib/staffSession.ts`
export { MASTER_HOME };

/** Раздел, который открывается после входа. */
export const homeFor = (role: SessionRole) => (role === "MASTER" ? MASTER_HOME : ADMIN_HOME);

/** Ответ `POST /admin/login`. */
export interface LoginResponse {
  success: boolean;
  token: string;
  role: SessionRole;
  /** Какой токен выдан: `admin` или `staff`. */
  kind: "admin" | "staff";
  user: { id: number | null; login: string; fullName: string; locations: string[] };
}

const getAdminToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

/** Сохраняет токен под роль и убирает токен другой роли — в браузере всегда ровно одна сессия. */
export function applyLogin(res: Pick<LoginResponse, "token" | "kind">): void {
  if (res.kind === "admin") {
    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    updateApiToken(res.token);
    clearStaffSession();
  } else {
    saveStaffSession(res.token);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    updateApiToken(null);
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
  updateApiToken(null);
  clearStaffSession();
}

/** Есть ли в браузере токен мастера (без проверки на сервере) — для быстрых редиректов. */
export const hasStaffToken = () => !!getStaffToken();

/**
 * Роль по сохранённым токенам — спрашивает сервер (`GET /admin/me`). `null` — не авторизован.
 * Токен, который сервер отверг (истёк, учётку заблокировали), сразу стирается. При сетевой ошибке токен не трогаем:
 * пропавший интернет не должен разлогинивать мастера в цеху.
 */
export async function detectSession(): Promise<SessionRole | null> {
  const candidates: { token: string | null; drop: () => void; onValid?: (t: string) => void }[] = [
    { token: getAdminToken(), drop: () => { localStorage.removeItem(AUTH_TOKEN_KEY); updateApiToken(null); }, onValid: updateApiToken },
    { token: getStaffToken(), drop: clearStaffSession },
  ];
  for (const c of candidates) {
    if (!c.token) continue;
    try {
      const { data } = await axios.get<{ role: SessionRole }>(`${API_BASE_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${c.token}` },
        timeout: 10_000,
      });
      c.onValid?.(c.token);
      return data.role;
    } catch (e) {
      if (e instanceof AxiosError && (e.response?.status === 401 || e.response?.status === 403)) c.drop();
    }
  }
  return null;
}
