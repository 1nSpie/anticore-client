// Хук для управления авторизацией

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { adminApi, updateApiToken } from "../_lib/api";
import { AUTH_TOKEN_KEY } from "../_lib/constants";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginData {
  login: string;
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  const [loginData, setLoginData] = useState<LoginData>({
    login: "",
    password: "",
  });

  // Проверка авторизации
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Проверяем наличие токена в localStorage
      if (typeof window === "undefined") {
        return false;
      }

      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        // Нет токена - это нормально, просто возвращаем false
        return false;
      }

      // Обновляем заголовок в axios
      updateApiToken(token);

      // Проверяем авторизацию на сервере
      const response = await adminApi.get("/admin/check-auth");
      return response.status === 200;
    } catch (error) {
      // Если ошибка 401 - токен невалидный или истек
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Токен невалидный, удаляем
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        updateApiToken(null);
        // Не логируем ошибку, так как это ожидаемое поведение
        return false;
      }

      // Для других ошибок логируем
      console.error("❌ Ошибка проверки авторизации:", error);
      return false;
    }
  }, []);

  // Инициализация при загрузке страницы
  useEffect(() => {
    const initializeAuth = async () => {
      // Ждем, пока window будет доступен (клиентская сторона)
      if (typeof window === "undefined") {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      try {
        const isAuthenticated = await checkAuth();

        setAuthState({
          isAuthenticated,
          isLoading: false,
        });
      } catch (error) {
        // Ошибка при инициализации - просто считаем, что не авторизован
        console.error("💥 Ошибка инициализации:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Обработка истечения сессии
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      localStorage.removeItem(AUTH_TOKEN_KEY);
      updateApiToken(null);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener("admin_session_expired", handleSessionExpired);

    return () => {
      window.removeEventListener("admin_session_expired", handleSessionExpired);
    };
  }, []);

  // Логин
  const handleLogin = useCallback(async () => {
    if (!loginData.login.trim() || !loginData.password.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      console.log("🔐 Попытка входа...");

      // Отправляем запрос без токена в заголовке
      const axiosModule = await import("axios");
      const axios = axiosModule.default;
      const tempApi = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api",
        timeout: 10000,
      });

      const response = await tempApi.post("/admin/login", loginData);
      console.log("✅ Ответ от сервера:", response.data);

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
          updateApiToken(response.data.token);

          console.log("💾 Токен сохранен в localStorage");

          const isAuthenticated = await checkAuth();

          if (isAuthenticated) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success("Успешный вход в админ-панель");
            setLoginData({ login: "", password: "" });
            return true;
          }
        } else {
          toast.error("Сервер не вернул токен");
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Ошибка входа:", error);

      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Неверный логин или пароль");
      } else {
        toast.error("Ошибка авторизации");
      }
      return false;
    }
  }, [loginData, checkAuth]);

  // Логаут
  const handleLogout = useCallback(async () => {
    try {
      // Отправляем запрос на логаут с текущим токеном
      await adminApi.post("/admin/logout");
    } catch (error) {
      console.error("Ошибка логаута:", error);
    } finally {
      // Очищаем localStorage и состояние
      localStorage.removeItem(AUTH_TOKEN_KEY);
      updateApiToken(null);

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      });

      toast.success("Вы вышли из админ-панели");
    }
  }, []);

  return {
    authState,
    loginData,
    setLoginData,
    handleLogin,
    handleLogout,
  };
};
