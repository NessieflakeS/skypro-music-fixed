import axios from "axios";
import { getAccessToken, setTokens, clearTokens } from "./tokenManager";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://webdev-music-003b5b991590.herokuapp.com";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[apiClient] Токен добавлен в заголовок");
    } else {
      console.log("[apiClient] Токен не найден");
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/user/token/refresh/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("[apiClient] Получена 401, пытаюсь обновить токен...");

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("Refresh token отсутствует");
        }

        const refreshResponse = await axios.post(`${API_URL}/user/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;

        setTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log("[apiClient] Токен обновлен, повторяю запрос");
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[apiClient] Не удалось обновить токен:", refreshError);
        clearTokens();

        if (typeof window !== "undefined") {
          if (
            !window.location.pathname.includes("/signin") &&
            !window.location.pathname.includes("/signup")
          ) {
            window.location.href = `/signin?redirect=${encodeURIComponent(
              window.location.pathname
            )}`;
          }
        }

        throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
      }
    }

    return Promise.reject(error);
  }
);