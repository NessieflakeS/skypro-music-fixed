import axios from 'axios';
import { getTokenFromCookies } from '@/utils/authSync';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webdev-music-003b5b991590.herokuapp.com';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('token');
    
    if (!token) {
      token = getTokenFromCookies();
      if (token) {
        localStorage.setItem('token', token);
      }
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[apiClient] Токен добавлен в заголовок');
    } else {
      console.log('[apiClient] Токен не найден');
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (originalRequest.url.includes('/user/token/refresh/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[apiClient] Получена 401, пытаюсь обновить токен...');
      
      try {
        let refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken && typeof window !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'refresh_token') {
              refreshToken = decodeURIComponent(value);
              break;
            }
          }
        }
        
        if (!refreshToken) {
          throw new Error('Refresh token отсутствует');
        }
        
        const refreshResponse = await axios.post(`${API_URL}/user/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.access;
        
        localStorage.setItem('token', newAccessToken);
        if (typeof window !== 'undefined') {
          document.cookie = `token=${newAccessToken}; path=/; max-age=604800; SameSite=Lax`;
        }
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('[apiClient] Токен обновлен, повторяю запрос');
        
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('[apiClient] Не удалось обновить токен:', refreshError);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          if (!window.location.pathname.includes('/signin') && 
              !window.location.pathname.includes('/signup')) {
            window.location.href = `/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        }
        
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    return Promise.reject(error);
  }
);