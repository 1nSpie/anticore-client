// Хук единого входа: логин и пароль → сервер определяет роль → админ идёт в админку, мастер — в свой кабинет.

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { adminApi } from "../_lib/api";
import { API_BASE_URL } from "../_lib/constants";
import { staffApi } from "../master/_lib/staffSession";
import { applyLogin, clearAllSessions, detectSession, hasStaffToken, type LoginResponse, type SessionRole } from "../_lib/session";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Роль вошедшего; null — не вошёл. */
  role: SessionRole | null;
}

interface LoginData {
  login: string;
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true, role: null });
  const [loginData, setLoginData] = useState<LoginData>({ login: "", password: "" });

  // При загрузке страницы выясняем, вошёл ли уже кто-то и в какой роли
  useEffect(() => {
    let cancelled = false;
    void detectSession()
      .catch(() => null)
      .then((role) => {
        if (!cancelled) setAuthState({ isAuthenticated: role !== null, isLoading: false, role });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Обработка истечения сессии админа
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      clearAllSessions();
      setAuthState({ isAuthenticated: false, isLoading: false, role: null });
    };
    window.addEventListener("admin_session_expired", handleSessionExpired);
    return () => window.removeEventListener("admin_session_expired", handleSessionExpired);
  }, []);

  /** Возвращает роль вошедшего или null, если вход не удался. */
  const handleLogin = useCallback(async (): Promise<SessionRole | null> => {
    if (!loginData.login.trim() || !loginData.password.trim()) {
      toast.error("Заполните все поля");
      return null;
    }
    try {
      // Без общего токена в заголовке: вход — публичный запрос
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/admin/login`, { login: loginData.login.trim(), password: loginData.password }, { timeout: 15_000 });
      const { token, kind, role } = response.data;
      if (!token || !kind || !role) {
        toast.error("Сервер вернул неполный ответ");
        return null;
      }
      applyLogin({ token, kind });
      setAuthState({ isAuthenticated: true, isLoading: false, role });
      setLoginData({ login: "", password: "" });
      toast.success(role === "MASTER" ? "Добро пожаловать!" : "Успешный вход в админ-панель");
      return role;
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message : undefined;
      toast.error(typeof message === "string" ? message : error instanceof AxiosError && error.response ? "Не удалось войти" : "Нет связи с сервером");
      return null;
    }
  }, [loginData]);

  // Выход: гасим сессию на сервере (для мастера это ещё и запись в журнал), затем чистим браузер
  const handleLogout = useCallback(async () => {
    try {
      if (hasStaffToken()) await staffApi.post("/staff/auth/logout");
      else await adminApi.post("/admin/logout");
    } catch {
      /* токен мог уже протухнуть — всё равно выходим */
    } finally {
      clearAllSessions();
      setAuthState({ isAuthenticated: false, isLoading: false, role: null });
      toast.success("Вы вышли");
    }
  }, []);

  return { authState, loginData, setLoginData, handleLogin, handleLogout };
};
