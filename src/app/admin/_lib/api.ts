// API клиент для админ-панели

import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY, ADMIN_API_TIMEOUT } from "./constants";

// Создаем экземпляр axios с настройками
export const createAdminApi = (token?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: ADMIN_API_TIMEOUT,
  });

  // Добавляем токен в заголовки если есть
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Interceptor для обработки 401 ошибок
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("admin_session_expired"));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Инициализируем без токена - он будет установлен при необходимости
// Это нужно, чтобы избежать проблем с SSR, когда localStorage недоступен
export const adminApi = createAdminApi();

// Обновление токена в API клиенте
export const updateApiToken = (token: string | null): void => {
  if (token) {
    adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common["Authorization"];
  }
};
